import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

const svgSamples = [
  `<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>`,
  `<svg width="100" height="100"><rect width="100" height="100" fill="blue" /></svg>`,
  `<svg width="120" height="120"><polygon points="60,0 120,120 0,120" fill="green" /></svg>`,
];

export default function SvgPreviewTool() {
  const { darkMode } = useDarkMode();
  const [svgCode, setSvgCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    setSvgCode('');
  };

  return (
    <div
      className={`max-w-5xl mx-auto p-6 space-y-6 transition-colors min-h-screen ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-2xl font-bold">SVG 預覽工具</h1>

      <div className="flex flex-col gap-4">
        <textarea
          rows={10}
          className="w-full p-4 border rounded font-mono resize-y bg-gray-100 dark:bg-gray-800 dark:text-white"
          placeholder="請在這裡貼上 SVG 程式碼..."
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            onClick={() => handleCopy(svgCode)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {copied ? '已複製！' : '複製 SVG'}
          </button>

          <button
            onClick={handleClear}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition"
          >
            清空
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">即時預覽：</h2>
          <div
            className="border p-4 rounded bg-white dark:bg-gray-100 overflow-auto"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">範例 SVG：</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {svgSamples.map((svg, idx) => (
              <div
                key={idx}
                className="p-4 border rounded bg-white dark:bg-gray-700 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full h-24 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <button
                  onClick={() => handleCopy(svg)}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  複製這個 SVG
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
