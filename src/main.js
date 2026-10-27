/**
 * App Bootstrap & Lifecycle Entry
 * Modularized from Pocket Winnie Core
 */

// Flush any pending debounced save before the page unloads
window.addEventListener('beforeunload', () => {
  if(_saveTimer) saveImmediate();
});

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
