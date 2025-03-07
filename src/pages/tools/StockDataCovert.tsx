import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function DataConverter() {
  const { darkMode } = useDarkMode();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const convertData = () => {
    try {
      const stockRegex = /"tse_\d+\.tw"\s*:\s*([\d\.]+)/g;
      const cryptoRegex = /\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g;
      let match;
      let values: string[] = [];

      while ((match = stockRegex.exec(inputText)) !== null) {
        values.push(match[1]);
      }

      while ((match = cryptoRegex.exec(inputText)) !== null) {
        values.push('$' + match[1].replace(/,/g, ''));
      }

      setOutputText(
        values.length > 0 ? values.join('\n') : '未找到符合的數值。'
      );
    } catch (error) {
      setOutputText('解析錯誤，請輸入正確的數據格式。');
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-6 rounded-lg shadow-lg transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h2
        className={`text-2xl font-bold text-center mb-4 ${
          darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
        }`}
      >
        數據轉換器
      </h2>

      {/* 文字輸入框 */}
      <div className="flex flex-col md:flex-row gap-4">
        <textarea
          className={`w-full md:w-1/2 p-3 border rounded resize-none ${
            darkMode
              ? 'border-gray-600 bg-gray-800 text-white'
              : 'border-gray-300 bg-white text-black'
          }`}
          rows={8}
          placeholder="在此輸入數據..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>

        <textarea
          className={`w-full md:w-1/2 p-3 border rounded resize-none ${
            darkMode
              ? 'border-gray-600 bg-gray-800 text-white'
              : 'border-gray-300 bg-white text-black'
          }`}
          rows={8}
          placeholder="轉換後的數值..."
          value={outputText}
          readOnly
        ></textarea>
      </div>

      {/* 轉換按鈕 */}
      <button
        onClick={convertData}
        className="w-full mt-4 p-2 text-white font-bold rounded bg-blue-500 hover:bg-blue-700"
      >
        轉換
      </button>
    </div>
  );
}
