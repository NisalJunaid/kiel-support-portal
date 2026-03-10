import { createContext, useContext } from 'react';

export const ThemeContext = createContext({
  darkModeEnabled: false,
  setDarkModeEnabled: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
