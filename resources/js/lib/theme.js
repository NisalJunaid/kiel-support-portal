export const DARK_MODE_STORAGE_KEY = 'kiel.theme.dark-mode';

export function getStoredDarkModePreference() {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
  if (value === '1') return true;
  if (value === '0') return false;
  return null;
}

export function hexToHsl(hex) {
  const clean = (hex || '').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;

  if (!/^[0-9A-Fa-f]{6}$/.test(full)) {
    return '0 0% 0%';
  }

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return `0 0% ${Math.round(l * 100)}%`;

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;

  h /= 6;

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyBrandingTheme(root, brandingTheme) {
  if (!root || !brandingTheme) return;

  root.style.setProperty('--primary', brandingTheme.primary);
  root.style.setProperty('--secondary', brandingTheme.secondary);
  root.style.setProperty('--accent', brandingTheme.accent);
  root.style.setProperty('--surface-border', brandingTheme.surfaceBorder);
  root.style.setProperty('--border', brandingTheme.surfaceBorder);
  root.style.setProperty('--input', brandingTheme.surfaceBorder);
  root.style.setProperty('--ring', brandingTheme.primary);
}
