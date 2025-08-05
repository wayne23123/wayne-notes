import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

const tools = [
  {
    to: '/tools/json-formatter',
    label: 'JSON Formatter',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-8 h-8 text-green-500"
        fill="currentColor"
      >
        <rect
          x="8"
          y="6"
          width="32"
          height="36"
          rx="6"
          className="fill-current opacity-10"
        />
        <rect
          x="8"
          y="6"
          width="32"
          height="36"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M18 18c-2 0-2-3 0-3v-3c-3 0-5 2-5 5s2 5 5 5v-3z"
          className="fill-current"
        />
        <path
          d="M30 15c2 0 2 3 0 3v3c3 0 5-2 5-5s-2-5-5-5v3z"
          className="fill-current"
        />
        <circle cx="18" cy="30" r="1.5" className="fill-current" />
        <circle cx="30" cy="30" r="1.5" className="fill-current" />
      </svg>
    ),
  },
  {
    to: '/tools/css-formatter',
    label: 'CSS Formatter',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-8 h-8 text-blue-500"
        fill="currentColor"
      >
        <rect
          x="8"
          y="6"
          width="32"
          height="36"
          rx="6"
          className="fill-current opacity-10"
        />
        <rect
          x="8"
          y="6"
          width="32"
          height="36"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          fontWeight="bold"
          fontFamily="monospace"
        >
          CSS
        </text>
        <path
          d="M15 18c-2 0-2-3 0-3v-3c-3 0-5 2-5 5s2 5 5 5v-3z"
          className="fill-current"
        />
        <path
          d="M33 15c2 0 2 3 0 3v3c3 0 5-2 5-5s-2-5-5-5v3z"
          className="fill-current"
        />
      </svg>
    ),
  },
  {
    to: '/tools/clamp-calculator',
    label: 'Clamp Calculator',
    icon: (
      <svg
        className="w-5 h-5 mr-2 text-purple-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 3v18m9-9H3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/tools/shadow-text-generator',
    label: 'Shadow Text Generator',
    icon: (
      <svg
        className="w-5 h-5 mr-2 text-pink-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 20h9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 4h16v12H4z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/tools/stock-data-covert',
    label: 'Stock Data Convert',
    icon: (
      <svg
        className="w-5 h-5 mr-2 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M3 10h18M3 14h18"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/tools/base64-svg',
    label: 'Base64 SVG',
    icon: (
      <svg
        className="w-5 h-5 mr-2 text-indigo-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12v6m0-6l3 3m-3-3l-3 3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/tools/word-count',
    label: 'Word Count',
    icon: (
      <svg
        className="w-5 h-5 mr-2 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 12h14M12 5v14"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Tools() {
  const { darkMode } = useDarkMode();

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">開發工具</h1>
      </div>

      <nav className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className={`flex items-center p-3 rounded text-sm transition-all duration-300 ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-200'
                : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            {tool.icon}
            <span className="pl-1">{tool.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
