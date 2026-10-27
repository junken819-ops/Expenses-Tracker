/**
 * 🍯 Pocket Winnie — Source Index
 * 
 * Modular Architecture Overview:
 * 
 * src/
 * ├── constants/       # Domain constants, categories, payment methods, i18n
 * ├── core/            # State store (S), persistence, DOM helper, router, modals
 * ├── utils/           # Formatters, calculators, BNM 5-sen rounding, greetings
 * ├── ui/              # Themes, wallpaper studio, floating AI alerts queue
 * ├── services/        # Gemini AI, live FX converter, WebAuthn biometrics, PDF generator
 * ├── features/        # Application business logic modules
 * │   ├── transactions/  # Add, edit, swipe-to-delete, tags, presets, auto-detect
 * │   ├── calendar/      # Daily calendar grid, day activity inspector
 * │   ├── annual/        # Annual and multi-year spending breakdowns
 * │   ├── budgets/       # Available pool dashboard, 50/30/20 auto-budget generator
 * │   ├── goals/         # Savings goals & deposits progress
 * │   ├── reminders/     # Bill reminders & due soon alerts
 * │   ├── recurring/     # Subscriptions & recurring automated transactions
 * │   ├── debts/         # Debts & IOUs tracking
 * │   ├── periodTracker/ # Period care cycle, calendar grid, symptoms & AI audit
 * │   ├── analytics/     # Income vs expense charts, health score, trends, predictions
 * │   ├── benchmarks/    # Malaysian market benchmark, DOSM CPI & price comparator
 * │   ├── petrol/        # Live petrol prices & tank fuel calculator
 * │   ├── mealSplitter/  # Receipt meal splitter, SST/service, WhatsApp reminders
 * │   ├── diningPassport/# Global dining & restaurant passport
 * │   ├── cashflow/      # 30-day cash flow forecast & payday survival
 * │   ├── heatmap/       # Visual annual spending heatmap matrix
 * │   ├── wrapped/       # Year-in-Review Pocket Winnie Wrapped slides
 * │   ├── aiCoach/       # Winnie AI Spending Coach (Gemini persona)
 * │   ├── challenges/    # Spending challenges & streaks
 * │   └── profile/       # User profile, full backup export/import, family wallet
 * └── main.js          # App lifecycle bootstrap & event listener
 */

console.log('🍯 Pocket Winnie modules loaded');
