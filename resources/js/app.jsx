import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { applyBrandingTheme } from '@/lib/theme';

function ThemeBridge({ branding, children }) {
  const [currentBranding, setCurrentBranding] = useState(branding);

  useEffect(() => {
    setCurrentBranding(branding);
  }, [branding]);

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

  const darkModeEnabled = Boolean(currentBranding?.dark_mode_enabled);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', darkModeEnabled);
    applyBrandingTheme(root, currentBranding, darkModeEnabled);

    if (currentBranding?.app_name) {
      document.title = currentBranding.app_name;
    }
  }, [currentBranding, darkModeEnabled]);

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
