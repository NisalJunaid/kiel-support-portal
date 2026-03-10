import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { applyBrandingTheme } from '@/lib/theme';
import { ThemeContext } from '@/lib/theme-context';

function resolveThemeMode(user) {
  return user?.theme_mode === 'dark' ? 'dark' : 'light';
}

function ThemeBridge({ branding, authUser, children }) {
  const [currentBranding, setCurrentBranding] = useState(branding);
  const [currentUser, setCurrentUser] = useState(authUser);
  const [themeMode, setThemeMode] = useState(resolveThemeMode(authUser));

  useEffect(() => {
    setCurrentBranding(branding);
  }, [branding]);

  useEffect(() => {
    setCurrentUser(authUser);
    setThemeMode(resolveThemeMode(authUser));
  }, [authUser]);

  useEffect(() => {
    const removeSuccessListener = router.on('success', (event) => {
      const nextBranding = event.detail.page?.props?.branding;
      const nextUser = event.detail.page?.props?.auth?.user;

      if (nextBranding) {
        setCurrentBranding(nextBranding);
      }

      setCurrentUser(nextUser || null);
      setThemeMode(resolveThemeMode(nextUser));
    });

    return () => {
      removeSuccessListener();
    };
  }, []);

  const darkModeEnabled = themeMode === 'dark';

  const setDarkModeEnabled = (enabled) => {
    const nextMode = enabled ? 'dark' : 'light';

    setThemeMode(nextMode);

    if (!currentUser) return;

    router.patch('/settings/theme-mode', { theme_mode: nextMode }, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      onError: () => {
        setThemeMode(resolveThemeMode(currentUser));
      },
    });
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
    const initialAuthUser = props.initialPage?.props?.auth?.user;

    createRoot(el).render(
      <ThemeBridge branding={initialBranding} authUser={initialAuthUser}>
        <App {...props} />
      </ThemeBridge>,
    );
  },
  progress: {
    color: '#0f766e',
  },
});
