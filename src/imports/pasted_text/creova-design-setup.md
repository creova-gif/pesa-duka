# CREOVA SME Business OS — Figma Design System Setup Guide

## Quick Start

### Step 1: Import Design Tokens
1. Install the **Tokens Studio for Figma** plugin (free)
2. Open the plugin → Settings → Import → Load JSON
3. Import `tokens-studio.json` from this package
4. All colors, typography, spacing, radii, and shadows will be available as Figma styles

### Step 2: Set Up Typography
1. Download **General Sans** from [Fontshare](https://www.fontshare.com/fonts/general-sans)
2. Install all weights (Regular, Medium, SemiBold, Bold)
3. Create text styles in Figma:
   - **XS** → General Sans Regular 12/16
   - **SM** → General Sans Regular 14/20
   - **Base** → General Sans Regular 16/24
   - **LG** → General Sans SemiBold 18/28
   - **XL** → General Sans Bold 24/32
4. For financial data, enable OpenType "Tabular Figures" in Figma's text settings

### Step 3: Create Color Styles
From the tokens, create these Figma color styles:

**Light Mode:**
| Style Name | Hex |
|------------|-----|
| bg/background | #F5F6FA |
| bg/card | #FFFFFF |
| bg/sidebar | #F0F2F5 |
| bg/muted | #EEF0F3 |
| bg/accent | #E8EBF0 |
| text/primary | #1C2333 |
| text/muted | #636B80 |
| border/default | #E2E4EB |
| brand/primary | #E56B0A |
| brand/primary-fg | #FFFFFF |
| semantic/success | #22C55E |
| semantic/warning | #F59E0B |
| semantic/error | #EF4444 |
| semantic/info | #3B82F6 |
| payment/cash | #64748B |
| payment/mpesa | #22C55E |
| payment/airtel | #EF4444 |
| payment/tigo | #3B82F6 |
| payment/credit | #F59E0B |

**Dark Mode:**
| Style Name | Hex |
|------------|-----|
| dark/bg/background | #151821 |
| dark/bg/card | #1A1E2A |
| dark/bg/sidebar | #181C27 |
| dark/bg/muted | #2D3345 |
| dark/text/primary | #ECF0F5 |
| dark/text/muted | #8A92A8 |
| dark/border/default | #282D3A |
| dark/brand/primary | #E8832A |

### Step 4: Build Components
Refer to `component-inventory.md` for the full list. Build in this order:
1. **Atoms:** Buttons, Badges, Icons, Inputs, Labels
2. **Molecules:** Nav Item, KPI Card, Product Card, Table Row, Transaction Item
3. **Organisms:** Sidebar, Data Table, Chart Card, Dialog, Cart Panel
4. **Pages:** Dashboard, POS, Inventory, Cashbook, Customers, Suppliers, Reports

### Step 5: Frame Sizes
- **Desktop:** 1440 × 900 (main design target)
- **Tablet:** 768 × 1024
- **Mobile:** 375 × 812 (Android / iPhone)

---

## File Structure Recommendation

```
CREOVA Design System
├── 📄 Cover Page
├── 🎨 Design Tokens
│   ├── Colors (Light + Dark)
│   ├── Typography Scale
│   ├── Spacing Scale
│   ├── Border Radii
│   └── Shadows
├── 🧩 Components
│   ├── Buttons (Primary, Secondary, Ghost, Icon)
│   ├── Inputs (Text, Search, Select, Date)
│   ├── Cards (KPI, Data, Product)
│   ├── Badges (Payment, Stock, Category, Credit)
│   ├── Tables (Header Row, Data Row, Action Row)
│   ├── Navigation (Sidebar, Nav Item)
│   ├── Dialogs (Standard, Receipt)
│   └── Charts (Bar, Donut, Line, Horizontal Bar)
├── 📱 Screens — Desktop (1440px)
│   ├── Dashboard
│   ├── POS
│   ├── Inventory
│   ├── Cashbook
│   ├── Customers
│   ├── Suppliers
│   └── Reports
├── 📱 Screens — Mobile (375px)
│   ├── Dashboard
│   ├── POS
│   ├── Inventory
│   ├── Cashbook
│   ├── Customers
│   ├── Suppliers
│   └── Reports
├── 📱 Screens — Dark Mode
│   └── All screens in dark theme
└── 🔗 Prototype Flows
    ├── Flow 1: Daily Opening → First Sale
    ├── Flow 2: Adding New Stock
    └── Flow 3: Checking Business Health
```

---

## Assets Included in This Package

| File | Description |
|------|-------------|
| `design-tokens.json` | Full design token reference (human-readable) |
| `tokens-studio.json` | Import directly into Tokens Studio for Figma plugin |
| `component-inventory.md` | Every component with specs, variants, and states |
| `desktop/*.png` | All 7 screens at 2880×1800 (2x @1440px) |
| `mobile/*.png` | All 7 screens at 750×1624 (2x @375px) |
| `desktop/dashboard-dark.png` | Dark mode reference |

---

## Design Principles (from the product doc)

1. **Speed first** — Every common action completes in under 3 taps
2. **Forgiving** — Easy undo, autosave, clear error messages in simple language
3. **Visual clarity** — High contrast, large touch targets, minimal text entry
4. **Contextual help** — Tooltips, onboarding flows, in-app guidance
5. **Bilingual by default** — Swahili and English throughout

## Currency & Localization

- Currency: **TZS** (Tanzanian Shilling), displayed as **TSh 88,100**
- Date format: **DD/MM/YYYY**
- Time: **24-hour**
- Thousands separator: **comma** (1,000,000)
- Business terms: duka (shop), rejareja (retail), deni (credit/debt), bidhaa (goods)
