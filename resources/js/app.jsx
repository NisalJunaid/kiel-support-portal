import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { applyBrandingTheme } from '@/lib/theme';
import { ThemeContext } from '@/lib/theme-context';

const THEME_MODE_STORAGE_KEY = 'ksp-theme-mode';

function readStoredThemeMode() {
  if (typeof window === 'undefined') return null;

  const mode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);

  return mode === 'dark' || mode === 'light' ? mode : null;
}

function ThemeBridge({ branding, children }) {
  const [currentBranding, setCurrentBranding] = useState(branding);
  const [themeMode, setThemeMode] = useState(() => readStoredThemeMode() || (Boolean(branding?.dark_mode_enabled) ? 'dark' : 'light'));

  useEffect(() => {
    setCurrentBranding(branding);
    if (!readStoredThemeMode()) {
      setThemeMode(Boolean(branding?.dark_mode_enabled) ? 'dark' : 'light');
    }
  }, [branding]);

  useEffect(() => {
    const removeSuccessListener = router.on('success', (event) => {
      const nextBranding = event.detail.page?.props?.branding;
      if (nextBranding) {
        setCurrentBranding(nextBranding);

        if (!readStoredThemeMode()) {
          setThemeMode(Boolean(nextBranding?.dark_mode_enabled) ? 'dark' : 'light');
        }
      }
    });

    return () => {
      removeSuccessListener();
    };
  }, []);

  const darkModeEnabled = themeMode === 'dark';

  const setDarkModeEnabled = (enabled, options = {}) => {
    const { persistPreference = true } = options;
    const nextMode = enabled ? 'dark' : 'light';

    setThemeMode(nextMode);

    if (typeof window === 'undefined') return;

    if (persistPreference) {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    } else {
      window.localStorage.removeItem(THEME_MODE_STORAGE_KEY);
    }
  };

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', darkModeEnabled);
    applyBrandingTheme(root, currentBranding, darkModeEnabled);

    if (currentBranding?.app_name) {
      document.title = currentBranding.app_name;
    }
  }, [currentBranding, darkModeEnabled]);

  return (
    <ThemeContext.Provider value={{ darkModeEnabled, setDarkModeEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
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
