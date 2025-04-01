import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function ClampCalculator() {
  const { darkMode } = useDarkMode();

  const [maxSize, setMaxSize] = useState(20);
  const [minSize, setMinSize] = useState(0);
  const [maxWidth, setMaxWidth] = useState(800); // 🔥 新增最大寬度
  const [clampResult, setClampResult] = useState('');
  const [formulaResult, setFormulaResult] = useState('');
  const [copyText, setCopyText] = useState('複製');

  const calculateClamp = () => {
    if (minSize > maxSize) {
      alert('❗ 最小值不能大於最大值');
      return;
    }

    const clamp = `clamp(${minSize}px, calc(${maxSize}px + (${minSize} - ${maxSize}) * ((100vw - ${maxWidth}px) / (${375} - ${maxWidth}))), ${maxSize}px);`;

    const formula = `
clamp(最小值, 計算公式, 最大值)
最小值 = ${minSize}px
最大值 = ${maxSize}px
響應範圍 = 375px ~ ${maxWidth}px
計算公式 = calc(${maxSize}px + (${minSize}px - ${maxSize}px) * ((100vw - ${maxWidth}px) / (375px - ${maxWidth}px)))
    `;

    setClampResult(clamp);
    setFormulaResult(formula);
  };

  const calcOnlyFormula = `calc(${minSize}px + ${
    maxSize - minSize
  } * ((100vw - 375px) / ${maxWidth - 375}))`;

  const copyToClipboard = (text: string, customText = '✓ 已複製') => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyText(customText);
        setTimeout(() => setCopyText('複製'), 2000);
      })
      .catch((err) => {
        console.error('複製失敗:', err);
      });
  };

  return (
    <div
      className={`max-w-lg mx-auto p-6 rounded-lg shadow-lg transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h2
        className={`text-2xl font-bold text-center mb-4 ${
          darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
        }`}
      >
        Clamp 計算器
      </h2>

      {/* 輸入欄位區 */}
      <div className="space-y-4">
        <div>
          <label className="block font-semibold">800px 時的大小(px):</label>
          <input
            type="number"
            value={maxSize}
            onChange={(e) => setMaxSize(parseFloat(e.target.value))}
            className={`w-full p-2 rounded border ${
              darkMode
                ? 'border-gray-600 bg-gray-800 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>

        <div>
          <label className="block font-semibold">375px 時的大小(px):</label>
          <input
            type="number"
            value={minSize}
            onChange={(e) => setMinSize(parseFloat(e.target.value))}
            className={`w-full p-2 rounded border ${
              darkMode
                ? 'border-gray-600 bg-gray-800 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>

        <div>
          <label className="block font-semibold">最大寬度（px）：</label>
          <input
            type="number"
            value={maxWidth}
            onChange={(e) => setMaxWidth(parseFloat(e.target.value))}
            className={`w-full p-2 rounded border ${
              darkMode
                ? 'border-gray-600 bg-gray-800 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
      </div>

      {/* 計算按鈕 */}
      <button
        onClick={calculateClamp}
        className="w-full mt-4 p-2 text-white font-bold rounded bg-blue-500 hover:bg-blue-700"
      >
        計算
      </button>

      {/* clamp 結果 */}
      {clampResult && (
        <div
          className={`mt-6 p-4 rounded-lg shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-100 border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Clamp 寫法：</h3>
            <button
              onClick={() => copyToClipboard(clampResult)}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {copyText}
            </button>
          </div>
          <p className="mt-2 font-mono">{clampResult}</p>
        </div>
      )}

      {/* clamp 計算說明 */}
      {formulaResult && (
        <div
          className={`mt-4 p-4 rounded-lg shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-100 border-gray-300'
          }`}
        >
          <h3 className="font-bold text-lg">計算公式說明：</h3>
          <pre className="whitespace-pre-wrap mt-2">{formulaResult}</pre>
        </div>
      )}

      {/* calc 寫法 */}
      {minSize !== null && maxSize !== null && (
        <div
          className={`mt-4 p-4 rounded-lg shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-100 border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">不限最大值寫法：</h3>
            <button
              onClick={() => copyToClipboard(calcOnlyFormula)}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {copyText}
            </button>
          </div>
          <p className="mt-2 font-mono">{calcOnlyFormula}</p>
        </div>
      )}
    </div>
  );
}
