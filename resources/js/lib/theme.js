function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex, fallback = '#000000') {
  const clean = (hex || '').trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((char) => `${char}${char}`).join('') : clean;

  if (!/^[0-9A-Fa-f]{6}$/.test(full)) {
    return fallback;
  }

  return `#${full.toLowerCase()}`;
}

function hexToRgb(hex, fallback = '#000000') {
  const normalized = normalizeHex(hex, fallback);

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixHex(base, target, ratio) {
  const amount = clamp(ratio, 0, 1);
  const a = hexToRgb(base);
  const b = hexToRgb(target);

  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

export function hexToHsl(hex) {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

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

function getContrastForegroundHex(backgroundHex) {
  const { r, g, b } = hexToRgb(backgroundHex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? '#0f172a' : '#f8fafc';
}

export function buildThemeTokens(branding, darkModeEnabled = false) {
  const primary = normalizeHex(branding?.primary_color, '#0f766e');
  const secondary = normalizeHex(branding?.secondary_color, '#f1f5f9');
  const accent = normalizeHex(branding?.accent_color, '#dbeafe');
  const border = normalizeHex(branding?.card_border_color || branding?.border_color || branding?.surface_border_color, '#94a3b8');

  const background = darkModeEnabled ? mixHex('#020617', secondary, 0.14) : mixHex('#ffffff', secondary, 0.62);
  const card = darkModeEnabled ? mixHex('#0b1220', secondary, 0.16) : mixHex('#ffffff', secondary, 0.34);
  const popover = darkModeEnabled ? mixHex('#0f172a', secondary, 0.2) : mixHex('#ffffff', secondary, 0.26);
  const muted = darkModeEnabled ? mixHex('#1e293b', secondary, 0.18) : mixHex('#f8fafc', secondary, 0.48);
  const input = darkModeEnabled ? mixHex(card, '#0b1220', 0.45) : mixHex('#ffffff', secondary, 0.5);

  return {
    '--background': hexToHsl(background),
    '--foreground': darkModeEnabled ? '210 40% 98%' : '222.2 84% 4.9%',
    '--card': hexToHsl(card),
    '--card-foreground': darkModeEnabled ? '210 40% 98%' : '222.2 84% 4.9%',
    '--popover': hexToHsl(popover),
    '--popover-foreground': darkModeEnabled ? '210 40% 98%' : '222.2 84% 4.9%',
    '--primary': hexToHsl(primary),
    '--primary-foreground': hexToHsl(getContrastForegroundHex(primary)),
    '--secondary': hexToHsl(secondary),
    '--secondary-foreground': hexToHsl(getContrastForegroundHex(secondary)),
    '--muted': hexToHsl(muted),
    '--muted-foreground': darkModeEnabled ? '215 20.2% 74%' : '215.4 16.3% 36%',
    '--accent': hexToHsl(accent),
    '--accent-foreground': hexToHsl(getContrastForegroundHex(accent)),
    '--surface-border': hexToHsl(border),
    '--border': hexToHsl(border),
    '--input': hexToHsl(input),
    '--ring': hexToHsl(primary),
  };
}

export function applyThemeTokens(root, tokens) {
  if (!root || !tokens) return;

  Object.entries(tokens).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

export function applyBrandingTheme(root, branding, darkModeEnabled = false) {
  applyThemeTokens(root, buildThemeTokens(branding, darkModeEnabled));
}
