export const THEME_STORAGE_KEY = 'orderix-theme';

export function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

export function getSystemTheme() {
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (_) {
    /* ignore */
  }
  return 'light';
}

export function getPreferredTheme() {
  return getStoredTheme() || getSystemTheme();
}

export function persistTheme(mode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (_) {
    /* ignore */
  }
}

export function applyThemeToDocument(mode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', mode === 'dark' ? '#0B1220' : '#2563EB');
  }
}
