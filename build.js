/**
 * 🍯 Pocket Winnie — Zero-Dependency Build System
 * 
 * Assembles modular source files from src/ into app.js,
 * validates JavaScript syntax, and verifies HTML compatibility.
 * 
 * Usage:
 *   node build.js          Build production app.js
 *   node build.js --watch  Watch src/ and auto-rebuild on change
 *   node build.js --check  Validate syntax and dependencies only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');
const OUTPUT_FILE = path.join(ROOT_DIR, 'app.js');
const HTML_FILE = path.join(ROOT_DIR, 'index.html');

// Ordered list of modules for concatenation
const MODULE_MANIFEST = [
  // 1. Core DOM helper (needs to be available early)
  'core/dom.js',

  // 2. Constants & Localization
  'constants/categories.js',
  'constants/paymentMethods.js',
  'constants/presets.js',
  'constants/i18n.js',

  // 3. State & Utilities
  'core/state.js',
  'utils/formatters.js',
  'core/persistence.js',

  // 4. UI: Theme & Wallpapers
  'ui/theme.js',
  'ui/wallpaper.js',

  // 5. Core Navigation & Modals
  'core/router.js',
  'core/modal.js',

  // 6. Features: Accounts & Recurring Core
  'features/transactions/accounts.js',
  'features/recurring/recurring.js',
  'features/analytics/healthScore.js',
  'features/transactions/categories.js',
  'features/transactions/homeBalance.js',
  'features/transactions/quickPresets.js',
  'features/analytics/renderHealth.js',
  'ui/alerts.js',
  'features/reminders/dueSoon.js',
  'features/transactions/recentTx.js',

  // 7. Calendar
  'features/calendar/calendarState.js',
  'features/calendar/calendarActions.js',

  // 8. Full TX & Annual Spending
  'features/transactions/fullTx.js',
  'features/annual/annualSpending.js',

  // 9. Budgets, Goals, Reminders, Debts, Accounts Page
  'features/budgets/budgets.js',
  'features/goals/goals.js',
  'features/reminders/reminders.js',
  'features/debts/debts.js',
  'features/transactions/accountsPage.js',

  // 10. Add Transaction & Smart Receipt Hub
  'features/transactions/addTx.js',
  'services/gemini.js',
  'features/transactions/universalUpload.js',
  'features/transactions/autoDetect.js',
  'features/budgets/aiBudget.js',
  'features/transactions/smartReceipt.js',
  'services/gsheet.js',

  // 11. CRUD Operations
  'features/budgets/budgetCrud.js',
  'features/goals/goalCrud.js',
  'features/reminders/reminderCrud.js',
  'features/recurring/recurringCrud.js',
  'features/debts/debtCrud.js',

  // 12. Period Tracker
  'features/periodTracker/periodCore.js',
  'features/periodTracker/periodCalendar.js',

  // 13. Analytics & Profile
  'features/analytics/analyticsCore.js',
  'features/profile/profile.js',
  'services/pdfGenerator.js',
  'features/analytics/healthMatrix.js',

  // 14. Benchmarks, Petrol, Meal Splitter
  'features/benchmarks/benchmarks.js',
  'features/benchmarks/priceComparator.js',
  'features/petrol/petrolTracker.js',
  'features/mealSplitter/mealSplitter.js',
  'features/mealSplitter/payLater.js',

  // 15. Services: Inflation, FX, Biometrics, Tax Relief
  'services/inflation.js',
  'services/fxRates.js',
  'services/biometric.js',
  'features/benchmarks/taxRelief.js',
  'utils/greeting.js',

  // 16. Advanced Features
  'features/analytics/spendingPrediction.js',
  'features/analytics/weeklyReport.js',
  'core/bootstrap.js',
  'features/challenges/challenges.js',
  'features/analytics/calorieSystem.js',
  'services/monthlyPdf.js',
  'features/profile/familyWallet.js',

  // 17. Compatibility Layer & Modern Features
  'core/compat.js',
  'features/diningPassport/passport.js',
  'features/transactions/tags.js',
  'features/cashflow/cashflow.js',
  'features/heatmap/heatmap.js',
  'features/wrapped/wrapped.js',
  'features/aiCoach/aiCoach.js',

  // 18. Lifecycle Bootstrap Entry
  'main.js'
];

function build() {
  const startTime = Date.now();
  console.log('🍯 Building Pocket Winnie from src/ ...');

  const banner = `/* ═══════════════════════════════════════════════════════════════════
   🍯 POCKET WINNIE — CORE APPLICATION BUNDLE
   Compiled from modular source files in src/
   Last build: ${new Date().toISOString()}
   ═══════════════════════════════════════════════════════════════════ */\n\n`;

  const chunks = [banner];
  let totalSourceLines = 0;
  let fileCount = 0;

  for (const relFile of MODULE_MANIFEST) {
    const fullPath = path.join(SRC_DIR, relFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Error: Source file not found: ${relFile}`);
      process.exit(1);
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n').length;
    totalSourceLines += lines;
    fileCount++;

    chunks.push(`/* ── Module: ${relFile} ── */\n`);
    chunks.push(content);
    chunks.push('\n\n');
  }

  const bundleCode = chunks.join('');
  fs.writeFileSync(OUTPUT_FILE, bundleCode, 'utf8');

  // Verify syntax of output bundle
  try {
    execSync(`node -c "${OUTPUT_FILE}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error('❌ Bundle Syntax Error:');
    console.error(err.stderr ? err.stderr.toString() : err.message);
    process.exit(1);
  }

  // Verify HTML functions
  let missingCount = 0;
  if (fs.existsSync(HTML_FILE)) {
    const html = fs.readFileSync(HTML_FILE, 'utf8');
    const regex = /on[a-z]+\s*=\s*"([^"]+)"/gi;
    const standardBuiltins = new Set(['parseInt', 'preventDefault', 'getElementById', 'click', 'add', 'max', 'Eggs']);
    const calledFunctions = new Set();
    let match;
    while ((match = regex.exec(html)) !== null) {
      for (const fn of match[1].matchAll(/([a-zA-Z0-9_$]+)\s*\(/g)) {
        if (!standardBuiltins.has(fn[1])) calledFunctions.add(fn[1]);
      }
    }

    for (const fn of calledFunctions) {
      const isDefined = new RegExp('(?:function\\s+' + fn + '\\s*\\(|window\\.' + fn + '\\s*=|(?:let|const|var)\\s+' + fn + '\\s*=)').test(bundleCode);
      if (!isDefined) {
        console.warn(`⚠️ Warning: HTML references undefined function: ${fn}`);
        missingCount++;
      }
    }
  }

  const duration = Date.now() - startTime;
  const sizeKb = (Buffer.byteLength(bundleCode, 'utf8') / 1024).toFixed(1);

  console.log(`✅ Build successful in ${duration}ms!`);
  console.log(`   📦 Modules: ${fileCount} files`);
  console.log(`   📝 Lines: ${totalSourceLines} lines assembled`);
  console.log(`   💾 Output: app.js (${sizeKb} KB)`);
  if (missingCount === 0) {
    console.log(`   🎯 HTML Compatibility: 100% verified (0 missing handlers)`);
  }
}

// CLI arguments handling
const args = process.argv.slice(2);

if (args.includes('--check')) {
  console.log('🔍 Checking syntax of all source modules in src/ ...');
  let errCount = 0;
  for (const relFile of MODULE_MANIFEST) {
    const fullPath = path.join(SRC_DIR, relFile);
    try {
      execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
    } catch (err) {
      console.error(`❌ Syntax error in ${relFile}`);
      errCount++;
    }
  }
  if (errCount === 0) {
    console.log(`✅ All ${MODULE_MANIFEST.length} modules passed syntax check!`);
  } else {
    process.exit(1);
  }
} else if (args.includes('--watch')) {
  build();
  console.log('\n👀 Watching src/ for changes... (Press Ctrl+C to stop)');
  let debounceTimer = null;
  fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`\n🔄 Change detected in src/${filename}. Rebuilding...`);
        build();
      }, 100);
    }
  });
} else {
  build();
}
