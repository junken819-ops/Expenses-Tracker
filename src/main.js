/**
 * App Bootstrap & Lifecycle Entry
 * Modularized from Pocket Winnie Core
 */

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
