import React, { createContext, useContext, useState } from 'react';

export const lightTheme = {
  dark: false,
  background: '#f5f5f5',
  cardBackground: '#ffffff',
  card: '#ffffff',
  text: '#111827',
  subText: '#6b7280',
  cardBorder: '#e5e7eb',
  border: '#e5e7eb',
  primary: '#2563eb',
  headerBackground: '#ffffff',
  headerText: '#111827',
  tabBarBackground: '#ffffff',
  tabBarActive: '#2563eb',
  tabBarInactive: '#6b7280',
  tabBarBorder: '#e5e7eb',
};

export const darkTheme = {
  dark: true,
  background: '#121826',
  cardBackground: '#1f2937',
  card: '#1f2937',
  text: '#f9fafb',
  subText: '#9ca3af',
  cardBorder: '#374151',
  border: '#374151',
  primary: '#60a5fa',
  headerBackground: '#1f2937',
  headerText: '#f9fafb',
  tabBarBackground: '#1f2937',
  tabBarActive: '#60a5fa',
  tabBarInactive: '#9ca3af',
  tabBarBorder: '#374151',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}