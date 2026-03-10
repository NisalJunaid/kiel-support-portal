import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';

const DARK_MODE_STORAGE_KEY = 'kiel.theme.dark-mode';

function getStoredDarkModePreference() {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
  if (value === '1') return true;
  if (value === '0') return false;
  return null;
}

function ThemeBridge({ children }) {
  const { props } = usePage();
  const branding = props?.branding;
  const [localDarkModeOverride, setLocalDarkModeOverride] = useState(() => getStoredDarkModePreference());

  useEffect(() => {
    const syncThemePreference = () => setLocalDarkModeOverride(getStoredDarkModePreference());

    window.addEventListener('kiel:theme-preference-changed', syncThemePreference);

    return () => {
      window.removeEventListener('kiel:theme-preference-changed', syncThemePreference);
    };
  }, []);

  const darkModeEnabled = useMemo(() => {
    if (typeof localDarkModeOverride === 'boolean') return localDarkModeOverride;
    return Boolean(branding?.dark_mode_enabled);
  }, [branding?.dark_mode_enabled, localDarkModeOverride]);

  useEffect(() => {
    if (!branding?.theme_hsl) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', branding.theme_hsl.primary);
    root.style.setProperty('--secondary', branding.theme_hsl.secondary);
    root.style.setProperty('--accent', branding.theme_hsl.accent);
    root.style.setProperty('--surface-border', branding.theme_hsl.surface_border);
    root.style.setProperty('--border', branding.theme_hsl.surface_border);
    root.style.setProperty('--input', branding.theme_hsl.surface_border);
    root.style.setProperty('--ring', branding.theme_hsl.primary);

    if (typeof localDarkModeOverride !== 'boolean') {
      root.classList.toggle('dark', Boolean(branding.dark_mode_enabled));
    }
  }, [branding, localDarkModeOverride]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkModeEnabled);
  }, [darkModeEnabled]);

  return children;
}

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    createRoot(el).render(
      <ThemeBridge>
        <App {...props} />
      </ThemeBridge>,
    );
  },
  progress: {
    color: '#0f766e',
  },
});
