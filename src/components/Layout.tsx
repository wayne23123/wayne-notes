import { Link, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // 控制手風琴展開狀態
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // 切換黑暗模式
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="w-full bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            📘 學習筆記
          </h1>
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </nav>
        </div>
      </header>

      {/* Layout: Sidebar + Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-16 shadow-md p-4 overflow-auto">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            📂 導航
          </h2>

          {/* 手風琴導航 */}
          <nav className="space-y-2">
            <AccordionItem
              title="JavaScript 筆記"
              isOpen={openSections['section1']}
              onClick={() => toggleSection('section1')}
              links={[
                { to: '/notes/js-basics', label: '變數與類型' },
                { to: '/notes/js-functions', label: '函式與閉包' },
              ]}
            />

            <AccordionItem
              title="React 筆記"
              isOpen={openSections['section2']}
              onClick={() => toggleSection('section2')}
              links={[
                { to: '/notes/react-hooks', label: 'Hooks' },
                { to: '/notes/react-router', label: 'React Router' },
              ]}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 ml-64 container mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* 手風琴元件 */
function AccordionItem({ title, isOpen, onClick, links }) {
  return (
    <div>
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
      >
        {title}
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </button>

      {/* CSS 過渡動畫 */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-4 mt-2 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ChevronRight 手寫 SVG
function ChevronRight() {
  return (
    <svg
      className="w-5 h-5 text-gray-500 dark:text-gray-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      ></path>
    </svg>
  );
}

// ChevronDown 手寫 SVG
function ChevronDown() {
  return (
    <svg
      className="w-5 h-5 text-gray-500 dark:text-gray-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      ></path>
    </svg>
  );
}
