// src/theme.js
// Theme management module for Pocket Winnie app
// Provides functions to toggle between light, dark, and sakura themes.
// Uses CSS variables defined in styles.css.

/**
 * Initialize theme based on saved preference or system setting.
 */
export function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
}

/**
 * Set the theme by updating the data-theme attribute on <html>.
 * @param {string} theme - One of 'light', 'dark', 'sakura'.
 */
export function setTheme(theme) {
  const root = document.documentElement;
  if (['light', 'dark', 'sakura'].includes(theme)) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

/**
 * Toggle between light and dark themes. Sakura is cycled separately via UI.
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}

/**
 * Cycle through all available themes.
 */
export function cycleTheme() {
  const themes = ['light', 'dark', 'sakura'];
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const idx = themes.indexOf(current);
  const next = themes[(idx + 1) % themes.length];
  setTheme(next);
}
