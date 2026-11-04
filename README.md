# SRBS Admixture and Paint Company — Sales Reporting System

A modern, responsive, frontend-only corporate sales reporting web application designed for the multi-tier construction chemical distribution hierarchy (Admixture & Sealer) of **SRBS Admixture and Paint Company** across Bangladesh.

Built with **Next.js (App Router)**, **JavaScript**, **Tailwind CSS**, **Lucide React Icons**, and **LocalStorage** for persistent state management.

---

## 🚀 Quick Start Guide (Running Locally)

### 1. Prerequisites
- **Node.js**: v18.17.0+
- **npm** or **pnpm** / **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 👥 Organizational Hierarchy Structure

```
Admin (System Administrator)
  └── National Sales Manager (NSM)
        └── Regional Sales Manager (RSM)
              └── Area Sales Manager (ASM)
                    └── Territory Sales Manager (TSM)
                          └── Senior Sales Executive (SSE)
                                └── Sales Executive (SE) [Field Operations & Daily Reporting]
```

---

## 📊 Core Features

1. **Step-by-Step Cascading Report Drilldown**:
   - NSM &rarr; RSM &rarr; ASM &rarr; TSM &rarr; SSE &rarr; SE dynamic selection.
   - Month & Year selector with instant Day-to-Day register generation.

2. **22-Field Daily Report Register**:
   - Date, Route today, Visits breakdown (Dealer, Retail, Mason, Painter, Site, Total auto).
   - Product orders (Admixture, Sealer, Total auto, Memo no).
   - Deliveries & collections (Deliv Adm, Deliv Slr, Total auto, Delivery value Tk, Collection today Tk, Total due Tk).
   - Stock tracking & field notes (Stock Admixture, Stock Sealer, Tomorrow route/plan, Problem/support needed).
   - Sticky Actions (View & Edit) next to Date for quick mobile access.

3. **Monthly Grand Totals & Analytics**:
   - Cumulative monthly summary row calculating visits, order volume, deliveries, cash collection, and closing stock.
   - Monthly CSV Export with all 22 client columns.

4. **100% Mobile Responsive**:
   - Optimized for smartphones, tablets, laptops, and wide monitors.

5. **Demo Credentials**:
   - All demo accounts use the standard 6-digit PIN: `123456`.
