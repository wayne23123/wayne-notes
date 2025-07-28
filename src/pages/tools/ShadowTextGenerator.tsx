import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import './styles.css';

const ShadowTextGenerator: React.FC = () => {
  const { darkMode } = useDarkMode();

  const [text, setText] = useState('預設文字');
  const [color, setColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#57887E');
  const [shadowColor, setShadowColor] = useState('rgba(0,0,0,0.3)');
  const [fontSize, setFontSize] = useState(52);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [fontWeight, setFontWeight] = useState('bold');
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [copied, setCopied] = useState(false);

  const htmlCode = `
<div class="title-hollow-wrapper">
  <span class="shadow-layer">${text}</span>
  <span class="stroke-layer">${text}</span>
</div>
`;

  const cssCode = `
.title-hollow-wrapper {
  position: relative;
  display: inline-block;
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
}

.shadow-layer {
  position: absolute;
  top: ${shadowOffsetY}px;
  left: 0px;
  color: ${shadowColor};
  z-index: 1;
}

.stroke-layer {
  position: relative;
  color: ${color};
  -webkit-text-stroke: ${strokeWidth}px ${strokeColor};
  text-stroke: ${strokeWidth}px ${strokeColor};
  z-index: 2;
}`;

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setHtmlCopied(true);
      setTimeout(() => setHtmlCopied(false), 1500);
    } catch (err) {
      console.error('複製 HTML 失敗', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('複製失敗', err);
    }
  };

  return (
    <div
      className={`max-w-lg mx-auto p-6 rounded-lg shadow-lg transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h2 className="text-xl mb-4">陰影文字產生器</h2>
      <input
        className={`border p-2 mb-4 w-full ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-100 border-gray-300'
        }`}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="請輸入文字"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <label>
          前景色：
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`w-10 h-10 p-1 border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`border p-2 w-full ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            />
          </div>
        </label>

        <label>
          邊框色：
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className={`w-10 h-10 p-1 border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className={`border p-2 w-full ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            />
          </div>
        </label>
        <label>
          陰影色：
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className={`w-10 h-10 p-1 border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            />
            <input
              type="text"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className={`border p-2 w-full ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            />
          </div>
        </label>
        <label>
          字體大小：
          <input
            className={`border p-2 mb-4 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-100 border-gray-300'
            }`}
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />{' '}
          px
        </label>
        <label>
          邊框粗細：
          <input
            className={`border p-2 mb-4 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-100 border-gray-300'
            }`}
            type="number"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />{' '}
          px
        </label>
        <label>
          陰影位移：
          <input
            className={`border p-2 mb-4 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-100 border-gray-300'
            }`}
            type="number"
            value={shadowOffsetY}
            onChange={(e) => setShadowOffsetY(Number(e.target.value))}
          />{' '}
          px
        </label>
        <label className="col-span-2">
          字重：
          <div className="flex gap-4 mt-1">
            {['normal', 'bold', 'bolder', 'lighter'].map((weight) => (
              <label key={weight}>
                <input
                  type="radio"
                  name="fontWeight"
                  value={weight}
                  checked={fontWeight === weight}
                  onChange={() => setFontWeight(weight)}
                />{' '}
                {weight}
              </label>
            ))}
          </div>
        </label>
      </div>

      <div
        className={`mb-6 flex justify-center ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-100 border-gray-300'
        }`}
      >
        <div
          className={`relative inline-block `}
          style={{ fontSize: fontSize, fontWeight: fontWeight }}
        >
          <span
            className="absolute z-1"
            style={{ color: shadowColor, top: `${shadowOffsetY}px` }}
          >
            {text}
          </span>
          <span
            className="relative z-2"
            style={{
              color,
              WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
              textStroke: `${strokeWidth}px ${strokeColor}`,
            }}
          >
            {text}
          </span>
        </div>
      </div>

      <button
        onClick={handleCopyHtml}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {htmlCopied ? '已複製 HTML！' : '複製當前 HTML'}
      </button>

      <pre
        className={`mt-4 p-4 overflow-auto text-sm rounded ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
        }`}
      >
        <code>{htmlCode}</code>
      </pre>

      <div className="h-10"></div>

      <button
        onClick={handleCopy}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {copied ? '已複製 CSS！' : '複製當前 CSS'}
      </button>

      <pre
        className={`mt-4 p-4 overflow-auto text-sm rounded ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
        }`}
      >
        <code>{cssCode}</code>
      </pre>
    </div>
  );
};

export default ShadowTextGenerator;
