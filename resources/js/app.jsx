import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
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

function ThemeBridge({ branding, children }) {
  const [currentBranding, setCurrentBranding] = useState(branding);
  const [localDarkModeOverride, setLocalDarkModeOverride] = useState(() => getStoredDarkModePreference());

  useEffect(() => {
    setCurrentBranding(branding);
  }, [branding]);

  useEffect(() => {
    const syncThemePreference = () => setLocalDarkModeOverride(getStoredDarkModePreference());

    window.addEventListener('kiel:theme-preference-changed', syncThemePreference);

    return () => {
      window.removeEventListener('kiel:theme-preference-changed', syncThemePreference);
    };
  }, []);

  useEffect(() => {
    const removeSuccessListener = router.on('success', (event) => {
      const nextBranding = event.detail.page?.props?.branding;
      if (nextBranding) {
        setCurrentBranding(nextBranding);
      }
    });

    return () => {
      removeSuccessListener();
    };
  }, []);

  const darkModeEnabled = useMemo(() => {
    if (typeof localDarkModeOverride === 'boolean') return localDarkModeOverride;
    return Boolean(currentBranding?.dark_mode_enabled);
  }, [currentBranding?.dark_mode_enabled, localDarkModeOverride]);

  useEffect(() => {
    if (!currentBranding?.theme_hsl) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', currentBranding.theme_hsl.primary);
    root.style.setProperty('--secondary', currentBranding.theme_hsl.secondary);
    root.style.setProperty('--accent', currentBranding.theme_hsl.accent);
    root.style.setProperty('--surface-border', currentBranding.theme_hsl.surface_border);
    root.style.setProperty('--border', currentBranding.theme_hsl.surface_border);
    root.style.setProperty('--input', currentBranding.theme_hsl.surface_border);
    root.style.setProperty('--ring', currentBranding.theme_hsl.primary);

    if (typeof localDarkModeOverride !== 'boolean') {
      root.classList.toggle('dark', Boolean(currentBranding.dark_mode_enabled));
    }
  }, [currentBranding, localDarkModeOverride]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkModeEnabled);
  }, [darkModeEnabled]);

  return children;
}

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    const initialBranding = props.initialPage?.props?.branding;

    createRoot(el).render(
      <ThemeBridge branding={initialBranding}>
        <App {...props} />
      </ThemeBridge>,
    );
  },
  progress: {
    color: '#0f766e',
  },
});
