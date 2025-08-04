import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function TextStatsTool() {
  const { darkMode } = useDarkMode();
  const [paragraphInput, setParagraphInput] = useState('');
  const [stringInput, setStringInput] = useState('');
  const [copiedParagraph, setCopiedParagraph] = useState(false);
  const [copiedString, setCopiedString] = useState(false);

  const clearParagraphInput = () => setParagraphInput('');
  const clearStringInput = () => setStringInput('');

  const trimLineEnd = () => {
    const cleaned = paragraphInput
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n');
    setParagraphInput(cleaned);
  };

  const formatParagraphs = () => {
    const formatted = paragraphInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => '  ' + line)
      .join('\n');
    setParagraphInput(formatted);
  };

  const copyParagraph = () => {
    navigator.clipboard.writeText(paragraphInput);
    setCopiedParagraph(true);
    setTimeout(() => setCopiedParagraph(false), 2000);
  };

  const copyString = () => {
    navigator.clipboard.writeText(stringInput);
    setCopiedString(true);
    setTimeout(() => setCopiedString(false), 2000);
  };

  const getStats = (input: string) => {
    const chineseChar = input.match(/[\u4e00-\u9fff]/g) || [];
    const chinesePunct =
      input.match(/[，。！？【】（）《》“”‘’、；：「」]/g) || [];
    const englishChar = input.match(/[A-Za-z]/g) || [];
    const englishPunct = input.match(/[.,!?;:'"()\[\]{}]/g) || [];
    const englishWords = input.match(/\b[a-zA-Z]+\b/g) || [];
    const numberChar = input.match(/\d/g) || [];
    const byteWords = input.match(/\b\S+\b/g) || [];

    return {
      total: input.length,
      numbers: numberChar.length,
      lines: input.split(/\n/).filter((l) => l.trim()).length,
      zhChars: chineseChar.length,
      zhPunct: chinesePunct.length,
      enChars: englishChar.length,
      enPunct: englishPunct.length,
      enWords: englishWords.length,
      byteWords: byteWords.length,
    };
  };

  const getLengthStats = (input: string) => {
    let length = 0;
    for (let char of input) {
      if (/[一-鿿！＠＃￥％…（）—【】「」、；：‘’“”。，《》？]/.test(char)) {
        length += 2;
      } else {
        length += 1;
      }
    }
    return {
      字數: length,
      字符: input.length,
      中文: (input.match(/[一-鿿]/g) || []).length,
      字母: (input.match(/[A-Za-z]/g) || []).length,
      數字: (input.match(/[0-9]/g) || []).length,
      符號: (
        input.match(/[！＠＃￥％…（）—【】「」、；：‘’“”。，《》？]/g) || []
      ).length,
    };
  };

  const stats = getStats(paragraphInput);
  const lengthStats = getLengthStats(stringInput);

  return (
    <div
      className={`max-w-5xl mx-auto p-4 space-y-8 transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: white;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #1d4ed8;
        }
      `}</style>

      <div
        className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md p-4 rounded-md`}
      >
        <h2 className="flex justify-center text-xl font-bold mb-4">段落統計</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={clearParagraphInput} className="btn">
            清空
          </button>
          <button onClick={trimLineEnd} className="btn">
            清除行尾空格
          </button>
          <button onClick={formatParagraphs} className="btn">
            段落整理＋前空格
          </button>
          <button onClick={copyParagraph} className="btn">
            {copiedParagraph ? '已複製！' : '複製'}
          </button>
        </div>

        <textarea
          rows={10}
          value={paragraphInput}
          onChange={(e) => setParagraphInput(e.target.value)}
          className={`w-full h-[400px] p-3 rounded border resize-none font-mono text-sm transition-colors ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-gray-100 border-gray-300 text-black'
          }`}
          placeholder="請輸入段落內容..."
        />

        <ul className="text-sm leading-6 mt-4">
          <li>總數：{stats.total}</li>
          <li>數字：{stats.numbers}</li>
          <li>行列（段落）數：{stats.lines}</li>
          <li>
            中文字數：{stats.zhChars} ｜ 中文標點符號數：{stats.zhPunct}
          </li>
          <li>
            英文字數：{stats.enChars} ｜ 英文標點符號數：{stats.enPunct}
          </li>
          <li>
            英文單詞數：{stats.enWords} ｜ 字節單詞數：{stats.byteWords}
          </li>
        </ul>
      </div>

      <div
        className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md p-4 rounded-md`}
      >
        <h2 className="flex justify-center text-xl font-bold mb-4">
          字符串長度計算
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={clearStringInput} className="btn">
            清除
          </button>
          <button onClick={copyString} className="btn">
            {copiedString ? '已複製！' : '複製'}
          </button>
        </div>

        <textarea
          rows={6}
          value={stringInput}
          onChange={(e) => setStringInput(e.target.value)}
          className={`w-full p-3 rounded border resize-none font-mono text-sm transition-colors ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-gray-100 border-gray-300 text-black'
          }`}
          placeholder="請輸入要計算的字串..."
        />

        <ul className="text-sm leading-6 mt-4">
          <li>
            {lengthStats.字數} 個字數 ｜ {lengthStats.字符} 個字符
          </li>
          <li>
            {lengthStats.中文} 個中文 ｜ {lengthStats.字母} 個字母 ｜{' '}
            {lengthStats.數字} 個數字 ｜ {lengthStats.符號} 個符號(全形)
          </li>
        </ul>
      </div>
    </div>
  );
}
