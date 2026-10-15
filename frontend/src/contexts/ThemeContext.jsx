import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize state immediately to avoid hydration issues
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('blog-theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark mode for SSR
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    const body = document.body;
    
    // Remove both classes first to avoid conflicts
    root.classList.remove('blog-dark-theme', 'blog-light-theme');
    body.classList.remove('blog-dark-theme', 'blog-light-theme');
    
    // Add the current theme class
    const themeClass = isDarkMode ? 'blog-dark-theme' : 'blog-light-theme';
    root.classList.add(themeClass);
    body.classList.add(themeClass);
    
    // Save preference to localStorage
    localStorage.setItem('blog-theme', isDarkMode ? 'dark' : 'light');
    
    // Force a style recalculation
    document.documentElement.style.display = 'none';
    document.documentElement.offsetHeight; // Trigger reflow
    document.documentElement.style.display = '';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
