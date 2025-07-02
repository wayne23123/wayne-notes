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

      if (values.length === 0) {
        const lines = inputText.trim().split('\n').filter(Boolean);
        const recordSize = 11;
        const tableRecords: string[] = [];

        let startIndex = lines.findIndex((line) => /^\d+$/.test(line.trim()));
        if (startIndex === -1) startIndex = 0;

        for (
          let i = startIndex;
          i + recordSize <= lines.length;
          i += recordSize
        ) {
          const name = lines[i + 1]?.trim();
          const code = lines[i + 2]?.trim();
          const price = lines[i + 3]?.trim();
          const volumeRaw = lines[i + 9]?.replace(/,/g, '').trim();

          const isValidName = /^[\u4e00-\u9fa5A-Za-z0-9]+$/.test(name);
          const isValidCode = /^\d{4}\.TW$/.test(code);
          const isValidPrice = /^\d+(\.\d+)?$/.test(price);
          const isValidVolume = /^\d+$/.test(volumeRaw);

          if (isValidName && isValidCode && isValidPrice && isValidVolume) {
            tableRecords.push(`${name}、${price}、${volumeRaw}、${code}`);
          }
        }

        setOutputText(
          tableRecords.length > 0
            ? tableRecords.join('\n')
            : '未找到符合的资料格式。'
        );
      } else {
        // 原始正则 match 有结果时 → 仅输出这部分
        setOutputText(values.join('\n'));
      }
    } catch (error) {
      setOutputText('解析错误，请输入正确的数据格式。');
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
        数据转换器
      </h2>

      {/* 文字输入框 */}
      <div className="flex flex-col md:flex-row gap-4">
        <textarea
          className={`w-full md:w-1/2 p-3 border rounded resize-none ${
            darkMode
              ? 'border-gray-600 bg-gray-800 text-white'
              : 'border-gray-300 bg-white text-black'
          }`}
          rows={8}
          placeholder="在此输入数据..."
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
          placeholder="转换后的数值..."
          value={outputText}
          readOnly
        ></textarea>
      </div>

      {/* 转换按钮 */}
      <button
        onClick={convertData}
        className="w-full mt-4 p-2 text-white font-bold rounded bg-blue-500 hover:bg-blue-700"
      >
        转换
      </button>
    </div>
  );
}
