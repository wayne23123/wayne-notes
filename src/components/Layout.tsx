import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

export default function Layout() {
  // 取得當前路由
  const location = useLocation();

  // 取得 `localStorage` 的初始值
  const getInitialSidebarState = () =>
    localStorage.getItem('sidebarOpen') !== 'false';

  // 全域狀態
  const { darkMode, setDarkMode } = useDarkMode();

  // 狀態管理
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
  // 控制手機版漢堡選單
  const [menuOpen, setMenuOpen] = useState(false);
  // 只允許一個手風琴展開
  const [openSection, setOpenSection] = useState<string | null>(null);
  // 動態 Sidebar
  const [currentSidebar, setCurrentSidebar] = useState<React.ReactNode | null>(
    null
  );

  // 儲存至 `localStorage`
  useEffect(
    () => localStorage.setItem('sidebarOpen', sidebarOpen.toString()),
    [sidebarOpen]
  );

  // 監聽路由變化，更新 Sidebar
  useEffect(() => {
    if (location.pathname === '/') {
      setCurrentSidebar(<HomeSidebar darkMode={darkMode} />);
    } else if (location.pathname.startsWith('/blog')) {
      setCurrentSidebar(
        <BlogSidebar
          openSection={openSection}
          toggleSection={setOpenSection}
          darkMode={darkMode}
        />
      );
    } else if (location.pathname.startsWith('/notes')) {
      setCurrentSidebar(
        <NotesSidebar
          openSection={openSection}
          toggleSection={setOpenSection}
          darkMode={darkMode}
        />
      );
    } else if (location.pathname.startsWith('/tools')) {
      setCurrentSidebar(<ToolsSidebar darkMode={darkMode} />);
    } else {
      setCurrentSidebar(null); // 其他頁面不顯示側邊欄
    }
  }, [location.pathname, darkMode]);

  // 手風琴展開/收合（當開啟 A，B 會自動關閉）
  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // 根據當前路由決定顯示的側邊欄
  const getSidebar = () => {
    if (location.pathname.startsWith('/blog')) {
      return (
        <BlogSidebar
          openSection={openSection}
          toggleSection={toggleSection}
          darkMode={darkMode}
        />
      );
    } else if (location.pathname.startsWith('/notes')) {
      return (
        <NotesSidebar
          openSection={openSection}
          toggleSection={toggleSection}
          darkMode={darkMode}
        />
      );
    } else if (location.pathname.startsWith('/tools')) {
      return <ToolsSidebar darkMode={darkMode} />;
    } else if (location.pathname === '/') {
      return <HomeSidebar darkMode={darkMode} />; // ✅ 傳遞 darkMode
    }
    return null; // 不顯示側邊欄
  };

  return (
    <div
      className={`flex flex-col transition-colors ${
        darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-200 text-black'
      }`}
    >
      {/* Header */}
      <header
        className={`w-full fixed top-0 left-0 z-50 transition-colors ${
          darkMode
            ? 'bg-gray-800 text-white shadow-lg'
            : 'bg-gray-100 text-black shadow-md'
        }`}
      >
        <div className="w-full px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div>
              <button
                className={`px-2 rounded-lg transition-all duration-300 ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
                }`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? '☰' : '☰'}
              </button>
            </div>
            <div className="px-2 text-2xl font-bold">
              <Link to="/" className="hover:text-blue-400">
                Wayne's Note
              </Link>
            </div>
          </div>

          {/* 漢堡選單 (手機版) */}
          <button
            className="lg:hidden px-2 py-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* Header 選單 (電腦版) */}
          <nav className="hidden lg:flex items-center">
            <NavLinks darkMode={darkMode} />
            <div className="px-2">
              <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </nav>
        </div>

        {/* 手機版的下拉選單 */}
        {menuOpen && (
          <nav className="lg:hidden bg-gray-700 text-white flex flex-col items-center py-4 space-y-3">
            <NavLinks darkMode={darkMode} onClick={() => setMenuOpen(false)} />
            <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </nav>
        )}
      </header>

      {/* Layout: Sidebar + Content */}
      <div className="flex pt-10">
        {/* Sidebar（可收合） */}
        {getSidebar() && (
          <aside
            className={`transition-all duration-300 fixed top-10 h-screen overflow-auto shadow-md ${
              sidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'
            } ${
              darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-300 text-black'
            }`}
          >
            {currentSidebar && sidebarOpen && getSidebar()}
          </aside>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* Header 選單 */
function NavLinks({
  onClick,
  darkMode,
}: {
  onClick?: () => void;
  darkMode: boolean;
}) {
  return (
    <>
      <Link
        to="/blog"
        className={`block p-2 rounded transition-all duration-300 ${
          darkMode
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            : 'bg-white text-gray-900 hover:bg-gray-200'
        }`}
        onClick={onClick}
      >
        部落格
      </Link>
      <Link
        to="/notes"
        className={`block p-2 rounded transition-all duration-300 ${
          darkMode
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            : 'bg-white text-gray-900 hover:bg-gray-200'
        }`}
        onClick={onClick}
      >
        筆記
      </Link>
      <Link
        to="/tools"
        className={`block p-2 rounded transition-all duration-300 ${
          darkMode
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            : 'bg-white text-gray-900 hover:bg-gray-200'
        }`}
        onClick={onClick}
      >
        工具
      </Link>
    </>
  );
}

/* 黑暗模式開關 */
function DarkModeToggle() {
  const { darkMode, setDarkMode } = useDarkMode();

  return (
    <div
      className={`relative w-14 h-7 rounded-full p-1 transition-colors cursor-pointer ${
        darkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`}
      onClick={() => setDarkMode(!darkMode)}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
          darkMode ? 'translate-x-7' : 'translate-x-0'
        }`}
      ></div>
    </div>
  );
}

/* **首頁專用側邊導覽列** */
function HomeSidebar({ darkMode }: { darkMode: boolean }) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">🏠 導覽列</h2>
      <nav className="space-y-2">
        <Link
          to="/blog"
          className={`block p-2 text-sm rounded transition-all duration-300 ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-900'
          }`}
        >
          📖 前往部落格
        </Link>
        <Link
          to="/notes"
          className={`block p-2 text-sm rounded transition-all duration-300 ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-900'
          }`}
        >
          📒 前往筆記
        </Link>
        <Link
          to="/tools"
          className={`block p-2 text-sm rounded transition-all duration-300 ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-900'
          }`}
        >
          🛠️ 開發工具
        </Link>
      </nav>
    </>
  );
}

/* 部落格側邊導覽列 */
function BlogSidebar({
  openSection,
  toggleSection,
  darkMode,
}: {
  openSection: string | null;
  toggleSection: (section: string) => void;
  darkMode: boolean;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">📰 部落格分類</h2>
      <nav className="space-y-2">
        <AccordionItem
          title="前端開發"
          isOpen={openSection === 'frontend'}
          onClick={() => toggleSection('frontend')}
          links={[
            { to: '/blog/frontend/react', label: 'React' },
            { to: '/blog/frontend/vue', label: 'Vue' },
          ]}
          darkMode={darkMode}
        />
        <AccordionItem
          title="後端開發"
          isOpen={openSection === 'backend'}
          onClick={() => toggleSection('backend')}
          links={[
            { to: '/blog/backend/nodejs', label: 'Node.js' },
            { to: '/blog/backend/django', label: 'Django' },
          ]}
          darkMode={darkMode}
        />
      </nav>
    </>
  );
}

/* 筆記側邊導覽列 */
function NotesSidebar({
  openSection,
  toggleSection,
  darkMode,
}: {
  openSection: string | null;
  toggleSection: (section: string) => void;
  darkMode: boolean;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">📂 筆記分類</h2>
      <nav className="space-y-2">
        <AccordionItem
          title="Git"
          isOpen={openSection === 'git'}
          onClick={() => toggleSection('git')}
          links={[
            { to: '/notes/git-basics', label: '常用 Git 指令' },
            // { to: '/notes/git-commands', label: '常用 Git 指令' },
          ]}
          darkMode={darkMode}
        />
        <AccordionItem
          title="JavaScript"
          isOpen={openSection === 'js'}
          onClick={() => toggleSection('js')}
          links={[
            { to: '/notes/js-basics', label: '變數與類型' },
            { to: '/notes/js-functions', label: '函式與閉包' },
          ]}
          darkMode={darkMode}
        />
        <AccordionItem
          title="React"
          isOpen={openSection === 'react'}
          onClick={() => toggleSection('react')}
          links={[
            { to: '/notes/react-hooks', label: 'Hooks' },
            { to: '/notes/react-router', label: 'React Router' },
          ]}
          darkMode={darkMode}
        />
      </nav>
    </>
  );
}

function ToolsSidebar({ darkMode }: { darkMode: boolean }) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">🛠️ 開發工具</h2>
      <nav className="space-y-2">
        <Link
          to="/tools/base64-svg"
          className={`block p-2 text-sm rounded transition-all duration-300 ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-900'
          }`}
        >
          base64-svg
        </Link>
        <Link
          to="/tools/tool2"
          className={`block p-2 text-sm rounded transition-all duration-300 ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-900'
          }`}
        >
          工具2
        </Link>
        <Link
          to="/tools/tool3"
          className={`block p-2 text-sm rounded transition-all duration-300 ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-900'
          }`}
        >
          工具3
        </Link>
      </nav>
    </>
  );
}

/* 手風琴元件 */
function AccordionItem({
  title,
  isOpen,
  onClick,
  links,
  darkMode,
}: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  links: { to: string; label: string }[];
  darkMode: boolean;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        className={`flex items-center justify-between w-full p-2 rounded transition-colors ${
          darkMode
            ? 'hover:bg-gray-700 text-gray-200'
            : 'hover:bg-gray-200 text-gray-900'
        }`}
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
              className={`block p-2 text-sm rounded transition-all duration-300 ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-200'
                  : 'hover:bg-gray-200 text-gray-900'
              }`}
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
      className="w-5 h-5"
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
      className="w-5 h-5"
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
