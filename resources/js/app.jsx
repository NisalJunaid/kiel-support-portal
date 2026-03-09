import '../css/app.css';
import { createInertiaApp, usePage } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';

function ThemeBridge({ children }) {
  const { branding } = usePage().props;

  useEffect(() => {
    if (!branding?.theme_hsl) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', branding.theme_hsl.primary);
    root.style.setProperty('--secondary', branding.theme_hsl.secondary);
    root.style.setProperty('--accent', branding.theme_hsl.accent);
    root.style.setProperty('--ring', branding.theme_hsl.primary);
  }, [branding]);

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
