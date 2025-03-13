import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext<{
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getInitialDarkMode = () => {
    const storedValue = localStorage.getItem('darkMode');
    return storedValue === null ? true : storedValue === 'true';
  };

  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());

    document.body.style.backgroundColor = darkMode ? '#111827' : '#E5E7EB';
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode 必须在 DarkModeProvider 内使用');
  }
  return context;
};
