# CREOVA SME OS — Master Component Index
## Complete Spec Coverage Map · 22 Files · 10/10 Core Features

---

## HOW TO USE

```jsx
// Run the full app:
import App from './App';
<App />

// Use any component standalone:
import MobileMoneyLedger from './MobileMoneyLedger';
import { EFDZReport, CompleteTaxDashboard } from './MissingFeatures';
import { KRAeTIMSInvoice, CashbookDashboard, TANQRDisplay } from './RemainingFeatures';
```

---

## SPEC SECTION C — ALL 10 CORE MVP FEATURES

| # | Spec Requirement | File | Export | Tier |
|---|---|---|---|---|
| C1 | Mobile Money Ledger (all 4 TZ wallets) | `MobileMoneyLedger.jsx` | `default` | Growth |
| C2 | TRA EFD-Compliant Invoicing + Z-Reports | `MissingFeatures.jsx` | `EFDZReport` | Growth |
| C3 | KRA eTIMS Invoicing (Kenya) | `RemainingFeatures.jsx` | `KRAeTIMSInvoice` | Business |
| C4 | Offline-First POS | `OfflineStateUI.jsx` + `POSSpeedPack.jsx` | `OfflineStateUI`, `QuickSaleModal` | Free |
| C5 | Inventory Management | `OpsFeaturePack.jsx` | `StockOrderModal` | Free |
| C6 | Simplified Bookkeeping Dashboard | `RemainingFeatures.jsx` | `CashbookDashboard` | Free |
| C7 | Tax Dashboard (VAT 18% + SDL 4% + PAYE + WHT) | `MissingFeatures.jsx` + `TRACompliance.jsx` | `CompleteTaxDashboard` | Business |
| C8 | USSD Interface (feature phones) | `MissingFeatures.jsx` | `USSDInterface` | Growth |
| C9 | Customer Management / CRM | `DebtFollowUpQueue.jsx` | `default` | Growth |
| C10 | Financial Reports for Bank Loans | `GovernmentFeatures.jsx` | `MicrofinanceCreditBridge` | Business |

---

## ALL 22 FILES

### App Shell
| File | What's inside |
|---|---|
| `App.jsx` | Full router + nav + sidebar + tier gating + theme + bottom nav. Import this to run the app. |

### Daily Operations
| File | What's inside |
|---|---|
| `MorningBriefing.jsx` | Daily greeting, yesterday stats, targets, restock alerts, debt summary, Start Selling CTA |
| `EndOfDayClose.jsx` | 4-step modal: Cash Count → Reconcile → Restock List → Day Summary |
| `POSSpeedPack.jsx` | `QuickSaleModal`, `SplitPaymentModal`, `RepeatLastOrder` |
| `OfflineStateUI.jsx` | Offline banner, sync queue display, reconnection handling, status pill |

### Finance & Payments
| File | What's inside |
|---|---|
| `MobileMoneyLedger.jsx` | ClickPesa integration, 5 wallets (M-Pesa/Airtel/Mixx/Halo/CRDB), auto-reconcile, webhook code |
| `InvoiceManager.jsx` | Full lifecycle: Draft→Sent→Partial→Paid, client history, overdue queue, payment recording |
| `RemainingFeatures.jsx` | `KRAeTIMSInvoice`, `CashbookDashboard`, `TANQRDisplay`, `PDPAConsentManager` |

### Compliance & Tax
| File | What's inside |
|---|---|
| `TRACompliance.jsx` | 5 tabs: Overview, VAT Returns, EFD Receipts, Filing Calendar, Audit Log |
| `MissingFeatures.jsx` | `EFDZReport`, `CompleteTaxDashboard` (VAT+SDL+PAYE+WHT), `USSDInterface`, `TierGating` |
| `LoyaltyAndTax.jsx` | `LoyaltySystem` (stamp cards + tiers), `TaxTracker` |

### People
| File | What's inside |
|---|---|
| `StaffManagement.jsx` | 4 tabs: Performance, Schedule (editable grid), Clock In/Out, Payroll (NSSF + PAYE) |
| `DebtFollowUpQueue.jsx` | Customer debt tracking, payment history dots, WhatsApp reminder preview |
| `OpsFeaturePack.jsx` | `StockOrderModal`, `StaffTracker` (per-staff sales + alerts), `InvoiceGenerator` |

### AI & Intelligence
| File | What's inside |
|---|---|
| `AkiliYaBiashara.jsx` | **THE SELLING POINT.** Insights feed + Chat advisor (Claude API) + Revenue predictions. Exports `AKILI_SYSTEM_PROMPT`. |
| `WeeklyAIDigest.jsx` | AI-generated weekly digest, payment method bar, lender-ready snapshot export |

### Credit & Growth
| File | What's inside |
|---|---|
| `CreditScoreCard.jsx` | Score ring (68/100), lender eligibility bar, 5 score factors, action plan |
| `FormalizationHub.jsx` | 5-step BRELA+TIN+NIDA+NSSF+Municipal guided onboarding with progress tracking |

### Government
| File | What's inside |
|---|---|
| `GovernmentFeatures.jsx` | `GovernmentDataDashboard`, `ImpactReportingSuite`, `MicrofinanceCreditBridge` |
| `BusinessSkillsAcademy.jsx` | 5 bilingual (SW+EN) courses: Bookkeeping, Credit, Stock, TRA Tax, Customers |

### Settings & UX
| File | What's inside |
|---|---|
| `SettingsPage.jsx` | Business profile, language toggle (SW/EN), receipt customisation, printer setup, subscription tier |
| `NotificationCenter.jsx` | Bell icon with badge, tabbed panel (All/Stock/Payments/System), mark read/dismiss |

---

## REGULATORY COMPLIANCE MAP

| Regulation | Coverage | File |
|---|---|---|
| TRA EFD mandatory (TZS 14M+ turnover) | Full — receipts, Z-reports, audit log, GPRS transmission | `TRACompliance.jsx`, `MissingFeatures.jsx` |
| TRA VAT 18% | Full — monthly filing, ETIMS export | `TRACompliance.jsx` |
| TRA SDL 4% | Full — monthly payroll levy calculator | `MissingFeatures.jsx` |
| TRA PAYE (Tanzania brackets) | Full — per-staff calculator | `MissingFeatures.jsx`, `StaffManagement.jsx` |
| TRA WHT (Withholding Tax) | Basic — dashboard entry | `MissingFeatures.jsx` |
| KRA eTIMS (Kenya, all businesses) | Full — QR codes, buyer/seller PINs, transmission | `RemainingFeatures.jsx` |
| BRELA business registration | Full — guided 5-step flow | `FormalizationHub.jsx` |
| NIDA national ID verification | Full — step 1 of formalisation | `FormalizationHub.jsx` |
| PDPA 2022 (Tanzania data law) | Full — consent manager, DPO, PDPC registration | `RemainingFeatures.jsx` |
| TAN-QR (BoT national QR standard) | Full — display + amount entry | `RemainingFeatures.jsx` |
| NSSF 10% employer contribution | Shown in payroll calculator | `StaffManagement.jsx` |

---

## BACKEND INTEGRATIONS (UI built, server needed)

| Integration | Code Template | Docs |
|---|---|---|
| ClickPesa webhooks (all 4 TZ wallets) | Top of `MobileMoneyLedger.jsx` | docs.clickpesa.com |
| TRA EFD GPRS transmission | `handleTransmit()` in `EFDZReport` | tra.go.tz |
| KRA eTIMS VSCU API | `transmit()` in `KRAeTIMSInvoice` | itax.kra.go.ke |
| Africa's Talking USSD server | Node.js handler in `USSDInterface` | africastalking.com |
| Claude API (Akili advisor) | `AKILI_SYSTEM_PROMPT` export + fetch stub | anthropic.com |
| Africa's Talking SMS reminders | Buttons in `DebtFollowUpQueue.jsx` | africastalking.com |

---

## TIER GATING REFERENCE

```javascript
import { checkAccess } from './App';
// checkAccess(feature, tier) → boolean

checkAccess('pos', 'free')          // true  — free feature
checkAccess('mobile_money', 'free') // false — needs Growth
checkAccess('mobile_money', 'growth') // true
checkAccess('etims_kenya', 'growth')  // false — needs Business
```

| Tier | Price | Key Features Unlocked |
|---|---|---|
| Free | TSh 0/mo | POS, inventory, cashbook, formalisation, skills academy, TAN-QR |
| Growth | TSh 7,500/mo | Invoices, all 4 wallets, EFD, staff, USSD, debt queue, Akili insights |
| Business | TSh 30,000/mo | Full tax dashboard, TRA compliance, Akili chat+predict, credit score, eTIMS Kenya, gov data |
| Enterprise | Custom | API access, white-label, custom integrations |

---

## DEFERRED TO v2.0 (per spec section C)

| Feature | Status |
|---|---|
| Embedded credit / BNPL disbursement | Credit score flywheel built; actual disbursement in v2 |
| Multi-location management | TierGating has placeholder; full UI in v2 |
| Real ML revenue forecasting | Akili predictions built as rule-based; ML in v2 |
| WhatsApp-native bot interface | WhatsApp buttons throughout; full bot in v2 |
| Full payroll module | PAYE calculator in StaffManagement; full payslip generation in v2 |
| Multi-currency (UGX, RWF, KES) | TSh + KSh only; expand in v2 with East Africa rollout |
| Live KRA eTIMS certification | UI built; 3-6 month KRA certification process required before go-live |
| BoT Fintech Sandbox approval | Apply via frsp.bot.go.tz — quarterly windows |

---

*CREOVA SME OS v1.0 · 22 components · March 2025*
