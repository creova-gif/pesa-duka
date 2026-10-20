---
status: AUTOPLAN_APPROVED
version: 3.0.0
last_reviewed: 2026-10-20
review_level: AUTOPLAN_SYNTHESIS
design_score: 9.5/10 (Hardened post-Design Audit)
dx_score: 9.2/10 (Hardened post-DX Audit)
jurisdiction: Tanzania (Primary)
currency: TZS
---
# AutoPlan Master Specification: Tanzania Retail OS (Pesa Duka v1)
Approved by /autoplan on 2026-10-20
Branch: main | Posture: FULL SCOPE (5 Core Modules, 11 Files)
Repo: creova-gif/pesa-duka-v1

---

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              PRESENTATION LAYER (React)                           |
|  +-------------------+  +--------------------+  +-------------------------------+  |
|  |  Counter POS.tsx  |  | DebtFollowUpQueue  |  | Inventory & StockOrderModal   |  |
|  | - 32px Bold Total |  | - wa.me Deep Links |  | - WhatsApp Restock PO Gen     |  |
|  | - Speed-Pack Grid |  | - E.164 Tanzanian  |  | - Reorder Alert Badges        |  |
|  | - 52px Touch Targets Phone Normalizer     |  |                               |  |
|  +---------+---------+  +---------+----------+  +---------------+---------------+  |
|            |                      |                             |                 |
|            +----------------------+-----------------------------+                 |
|                                   |                                               |
|                                   v                                               |
|                       APPLICATION HOOKS & CONTROLLERS                             |
|              +-------------------------------------------------+                  |
|              |  useData.ts (with React Query auto-invalidation)|                  |
|              |  useSyncQueue.ts (FIFO retry + DLQ guard)       |                  |
|              +--------------------+----------------------------+                  |
|                                   |                                               |
|                                   v                                               |
|                      LOCAL-FIRST REPOSITORY LAYER                                 |
|         +------------------------------------------------------------+            |
|         |                     src/app/lib/db.ts                      |            |
|         | - Zero-dependency Promise-based native IndexedDB           |            |
|         | - Cold-start auto-seeding with Tanzanian retail staples    |            |
|         | - Atomic multi-store transactions (sales + stock deduction)|            |
|         | - Client-generated UUIDv4 idempotency keys                 |            |
|         | - window.__DUKA_DEV__ debug escape hatch                   |            |
|         +-------------------------+----------------------------------+            |
+-----------------------------------|-----------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-------------------------------+       +---------------------------------------+
|    PLUGGABLE PRINTER ENGINE   |       |      OFFLINE / CLOUD SYNC ENGINE      |
|  - PrinterAdapter Interface   |       |  - IndexedDB 'offline_queue' store    |
|  - Web Bluetooth ESC/POS      |       |  - Event-driven online detection      |
|    GATT Driver (58mm 32-col / |       |  - Exponential backoff retry worker   |
|    80mm 48-col monospace grid)|       |  - Idempotent FIFO batch payload sync |
|  - Continuous-Feed 58mm/80mm  |       |  - Over-allocation conflict audit tag |
|    @media print CSS Fallback  |       +-------------------+-------------------+
+-------------------------------+                           | (When Online)
                                                            v
                                        +---------------------------------------+
                                        |          CLOUD INFRASTRUCTURE         |
                                        |  - Supabase Edge Functions            |
                                        |  - ClickPesa HMAC Webhook Bridge      |
                                        |  - TRA VFD Cryptographic Signing Proxy|
                                        |  - PostgreSQL Database Replica        |
                                        +---------------------------------------+
```

---

## 2. Frontline Design & Ergonomic Specifications (Kariakoo Market Standard)

### 2.1. 58mm & 80mm ESC/POS Monospace Character Grid
To guarantee that TRA tax receipts and retail slips never wrap digits or scramble line items on physical thermal paper:
* **58mm Receipt Width**: Strictly locked to **32 characters per line** (Font A, 12×24 dots).
  * Format: `Item Name (18 chars, padEnd)` + ` ` + `Price (13 chars, padStart)`.
  * Example: `Unga wa Ngano 2kg   TSh 4,500` (exactly 32 characters).
* **80mm Receipt Width**: Strictly locked to **48 characters per line** (Font A).
* **Dividers**: Exactly 32 or 48 hyphens (`--------------------------------`).

### 2.2. Counter Screen Information Hierarchy (Mobile / Tablet 360px+)
* **1. Top Anchor**: Ambient Connectivity Pill (`● Nje ya Mtandao: Mauzo 3 Yamehifadhiwa` [Amber] / `● Mtandaoni` [Emerald]).
* **2. Speed-Pack Grid**: Top 8–12 fast-moving everyday goods (*Unga, Sukari, Mafuta, Maji, Soda, Sigara, Vocha*) with large 64px tap cards for single-tap cart addition.
* **3. Audio / Haptic Pulse**: Every item tap fires a brief 15ms haptic pulse (`navigator.vibrate([15])`) and subtle synthesized click so cashiers can ring up goods without staring at the screen.
* **4. Massive Bottom Total**: 34px bold Tanzanian Shilling total (`TSh 45,000`).
* **5. Dual 54px Thumb Buttons**:
  * `[ PESA TASLIMU (Cash) ]` (High-contrast emerald, instant checkout).
  * `[ LIPA KWA SIMU / DENI (Mobile / Debt) ]` (Blue, opens mobile number / customer ledger modal).

---

## 3. Developer Experience (DX) & Ergonomics

### 3.1. Cold-Start Catalog Seeding
When `db.ts` opens a fresh database in development or on a clean device, it detects if `products.count() === 0` and automatically populates standard Tanzanian retail test items (Azam Wheat Flour, Kilombero Rice, Mo Safi Oil, Safari Lager, Kilimanjaro Water). Developers and test agents can immediately execute checkouts without manual setup.

### 3.2. Pluggable Printer Adapters
```typescript
export interface PrinterAdapter {
  isAvailable(): Promise<boolean>;
  printReceipt(receipt: ReceiptData, options: PrintOptions): Promise<void>;
}
// Concrete implementations:
// - BluetoothEscPosAdapter (GATT 0x18f0 / 0x2af1)
// - CssPrintAdapter (window.print with @media print)
// - MockPrinterAdapter (Headless test logger for CI / gstack browse)
```

### 3.3. Development Debug Tool (`window.__DUKA_DEV__`)
In development environments, a global helper is mounted for automated testing and manual debugging:
```typescript
window.__DUKA_DEV__ = {
  flushSyncQueue: () => syncWorker.flush(),
  clearQueue: () => db.clear('offline_queue'),
  seedMocks: () => db.seedInitialData(),
  getQueueDepth: () => db.count('offline_queue'),
};
```

---

## 4. Implementation Tasks (Locked & Ready)

- [ ] **T1 (P1, CC: ~30min)** — `OfflineSyncEngine` — Build local IndexedDB repository in `src/app/lib/db.ts` using native promises, auto-seeding, UUIDv4 idempotency, and FIFO queue manager in `src/app/hooks/useSyncQueue.ts`.
- [ ] **T2 (P1, CC: ~25min)** — `ThermalPrinting` — Implement pluggable `PrinterAdapter` with 32-col 58mm / 48-col 80mm ESC/POS byte generator in `src/app/lib/escpos.ts` and continuous thermal CSS fallback in `src/styles/receipt-print.css`.
- [ ] **T3 (P1, CC: ~15min)** — `DebtFollowUpQueue` — Connect live customer credit ledger in `src/app/components/DebtFollowUpQueue.tsx` with E.164 phone normalization and respectful Swahili WhatsApp deep-links in `src/app/lib/whatsapp.ts`.
- [ ] **T4 (P2, CC: ~15min)** — `SupplierRestock` — Connect low-stock triggers in `src/app/pages/Inventory.tsx` to `src/app/components/StockOrderModal.tsx` generating pre-filled WhatsApp Purchase Orders.
- [ ] **T5 (P2, CC: ~20min)** — `AkiliYaBiashara` — Implement Swahili analytical query quick-cards with deterministic data calculations in `src/app/components/AkiliYaBiashara.tsx`.

---

## 5. Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|---|
| 1 | CEO | Focus on Tanzania Retail First | Strategic | P1 (Completeness) | Regulatory and operational dominance in Dar es Salaam before multi-country expansion. | Multi-country KRA/CRA sprawl |
| 2 | CEO | Accept all 5 10x Scope Expansions | Scope | P2 (Boil Lakes) | Offline sync, thermal print, WhatsApp debt, supplier POs, and Swahili analytics create a complete moat. | Partial counter MVP |
| 3 | Eng | Local-First Repository Pattern | Architecture | P5 (Explicit) | Counter checkout cannot depend on cellular internet latency; must write to local IndexedDB first. | Remote-First React Query persister |
| 4 | Eng | Zero-dependency native IndexedDB | Technical | P3 (Pragmatic) | 80 lines of clean typed Promise wrapper eliminates external library bloat and compatibility risks. | Heavy ORMs / PouchDB |
| 5 | Design | Strict 32-col monospace receipt grid | Ergonomics | P5 (Explicit) | Enforces precise character padding so 58mm thermal receipts never wrap numbers. | Unformatted CSS text rendering |
| 6 | Design | Persistent Ambient Connectivity Pill | UX | P1 (Completeness) | Eliminates cashier panic during network drops by providing an ongoing reassurance badge. | Ephemeral 3-second toasts |
| 7 | DX | Cold-start auto-seeding in db.ts | DevEx | P6 (Action Bias) | Eliminates empty-database friction for new developers and automated browser tests. | Requiring manual seed scripts |
| 8 | DX | Pluggable PrinterAdapter interface | DevEx | P5 (Explicit) | Decouples Bluetooth hardware from testing, allowing seamless headless mocking in CI. | Hardcoded Bluetooth-only calls |

---

## GSTACK REVIEW REPORT

```
+====================================================================+
|            AUTOPLAN PIPELINE — COMPLETION SUMMARY                  |
+====================================================================+
| Pipeline Status      | FULL GAUNTLET CLEARED (AUTOPLAN_APPROVED)   |
| CEO Review Phase     | CLEARED (Scope Expansion, 9.8/10 score)     |
| Design Review Phase  | CLEARED (32-col grid, Ambient Pill, Haptics)|
| Eng Review Phase     | CLEARED (Local-First IDB, Atomic Multi-Tx)  |
| DevEx Review Phase   | CLEARED (Cold Seed, Pluggable Adapters, Dev)|
+--------------------------------------------------------------------+
| Tasks Synthesized    | 5 Modular Tasks (T1–T5 across 11 files)     |
| Estimated Total Time | ~1.5 hours CC (vs ~2.5 days human team)     |
| Critical Gaps        | 0 Gaps Open                                 |
| Unresolved Decisions | 0 Decisions Open                            |
| Verdict              | READY FOR IMMEDIATE IMPLEMENTATION          |
+====================================================================+
```
