// import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function TextStatsTool() {
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`max-w-5xl mx-auto p-4 space-y-8 transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    ></div>
  );
}
