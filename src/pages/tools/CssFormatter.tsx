import { useEffect, useState, useRef } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function CssTool() {
  const { darkMode } = useDarkMode();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  // 格式化 CSS
  const formatCss = () => {
    try {
      let css = input;

      // 保留 <style> 標籤的開頭與結尾
      const styleOpen = css.includes('<style>') ? '<style>' : '';
      const styleClose = css.includes('</style>') ? '</style>' : '';
      css = css.replace(/<\/?style>/g, '').trim(); // 移除 style 標籤本體處理

      // 分段處理每個區塊
      const rules = css
        .split('}')
        .map((rule) => {
          const [selector, body] = rule.split('{');
          if (!selector || !body) return '';

          const cleanSelector = selector.trim();
          const props = body
            .split(';')
            .map((prop) => prop.trim())
            .filter(Boolean)
            .map((prop) => `  ${prop};`) // 強制加上分號
            .join('\n');

          return `${cleanSelector} {\n${props}\n}`;
        })
        .filter(Boolean)
        .join('\n\n');

      const finalCss = `${styleOpen ? styleOpen + '\n' : ''}${rules}${
        styleClose ? '\n' + styleClose : ''
      }`;

      setInput(finalCss);
    } catch (err) {
      alert('CSS 格式化失敗，請確認格式正確');
    }
  };

  // 壓縮 CSS
  const minifyCss = () => {
    try {
      let css = input;

      // 保留 <style> 標籤頭尾
      const styleOpen = css.includes('<style>') ? '<style>' : '';
      const styleClose = css.includes('</style>') ? '</style>' : '';
      css = css.replace(/<\/?style>/g, '').trim();

      // 移除註解
      css = css.replace(/\/\*[\s\S]*?\*\//g, '');

      // 去除換行與縮排
      css = css.replace(/\s+/g, ' ');

      // 移除屬性前後空白
      css = css.replace(/\s*{\s*/g, '{');
      css = css.replace(/\s*}\s*/g, '}');
      css = css.replace(/\s*;\s*/g, ';');
      css = css.replace(/\s*:\s*/g, ':');
      css = css.replace(/\s*,\s*/g, ',');

      // 確保每個屬性後都有 `;`
      css = css.replace(/([^;{}])}/g, '$1;}'); // 如果在 } 前沒有 ; 則補上

      const finalCss = `${styleOpen}${css}${styleClose}`;

      setInput(finalCss);
    } catch (err) {
      alert('壓縮化失敗，請確認 CSS 正確');
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(input).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      alert('瀏覽器不支援複製功能');
    }
  };

  // 清除輸入
  const clearInput = () => {
    setInput('');
  };

  useEffect(() => {
    const savedCss = localStorage.getItem('css_tool_input');
    if (savedCss) {
      setInput(savedCss);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('css_tool_input', input);
  }, [input]);

  return (
    <div
      className={`max-w-5xl mx-auto p-4 transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-2xl font-bold text-center mb-4">
        CSS 格式化 / 壓縮工具
      </h1>

      <div className="mb-4 flex gap-2 justify-center flex-wrap">
        <button
          onClick={formatCss}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          格式化
        </button>
        <button
          onClick={minifyCss}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          壓縮化
        </button>
        <button
          onClick={clearInput}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          清除
        </button>
      </div>

      <div
        className={`max-w-5xl mx-auto p-4 transition-colors ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
        }`}
      >
        <div className="mb-4 flex gap-2 justify-center flex-wrap">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {copied ? '已複製!' : '複製'}
          </button>
        </div>
      </div>

      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="請貼上或輸入 CSS"
        className={`w-full h-[400px] p-3 rounded border resize-none font-mono text-sm transition-colors ${
          darkMode
            ? 'bg-gray-800 border-gray-600 text-white'
            : 'bg-gray-100 border-gray-300 text-black'
        }`}
      />
    </div>
  );
}
