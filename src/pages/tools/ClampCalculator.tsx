import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext'; // 引入黑暗模式 Context

export default function ClampCalculator() {
  const { darkMode } = useDarkMode(); // 取得 darkMode 狀態
  const [maxSize, setMaxSize] = useState(20);
  const [minSize, setMinSize] = useState(0);
  const [clampResult, setClampResult] = useState('');
  const [formulaResult, setFormulaResult] = useState('');
  const [copyText, setCopyText] = useState('複製'); // 控制按鈕文字

  // 計算 Clamp 值
  const calculateClamp = () => {
    const formula = `clamp(${minSize}px, calc(${maxSize}px + (${minSize}px - ${maxSize}px) * ((100vw - 800px) / (375px - 800px))), ${maxSize}px);`;

    setClampResult(formula);
    setFormulaResult(`
      clamp(最小值, 計算公式, 最大值)
      最小值 = ${minSize}px
      最大值 = ${maxSize}px
      計算公式 = calc(${maxSize}px + (${minSize}px - ${maxSize}px) * ((100vw - 800px) / (375px - 800px)))
    `);
  };

  // 複製到剪貼簿
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(clampResult)
      .then(() => {
        setCopyText('✓ 已複製'); // ✅ 變成「✓ 已複製」

        // 2 秒後恢復按鈕文字
        setTimeout(() => {
          setCopyText('複製');
        }, 2000);
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

      {/* 文字輸入框 */}
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
      </div>

      {/* 計算按鈕 */}
      <button
        onClick={calculateClamp}
        className="w-full mt-4 p-2 text-white font-bold rounded bg-blue-500 hover:bg-blue-700"
      >
        計算
      </button>

      {/* Clamp 結果 */}
      {clampResult && (
        <div
          className={`mt-6 p-4 rounded-lg shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-100 border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Clamp 結果：</h3>
            <button
              onClick={copyToClipboard}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {copyText} {/* ✅ 按鈕文字會變化 */}
            </button>
          </div>
          <p className="mt-2 font-mono">{clampResult}</p>
        </div>
      )}

      {/* 計算公式 */}
      {formulaResult && (
        <div
          className={`mt-4 p-4 rounded-lg shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-100 border-gray-300'
          }`}
        >
          <h3 className="font-bold text-lg">計算公式：</h3>
          <pre className="whitespace-pre-wrap mt-2">{formulaResult}</pre>
        </div>
      )}
    </div>
  );
}
