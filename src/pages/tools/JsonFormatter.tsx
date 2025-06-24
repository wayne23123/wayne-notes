import { useEffect, useState, useRef } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function JsonTool() {
  const { darkMode } = useDarkMode();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const inputRef = useRef(null);

  // 初始载入 localStorage
  useEffect(() => {
    const savedInput = localStorage.getItem('json_input') || '';
    const savedOutput = localStorage.getItem('json_output') || '';
    setInput(savedInput);
    setOutput(savedOutput);
  }, []);

  // 写入 localStorage
  useEffect(() => {
    localStorage.setItem('json_input', input);
    localStorage.setItem('json_output', output);
  }, [input, output]);

  // 快捷键事件（Ctrl+L / Ctrl+Shift+L）
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (e.shiftKey) {
          handleCompact();
        } else {
          handleFormat();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [input]);

  // 快照储存
  const saveSnapshot = () => {
    setHistory((prev) => [...prev, { input, output }]);
    setRedoStack([]);
  };

  const handleFormat = () => {
    try {
      saveSnapshot();
      const obj = evalToJson(input); // 修复/支援非纯 JSON 格式
      setOutput(JSON.stringify(obj, null, 2));
    } catch (e) {
      setOutput(`⚠️ 格式错误：${e.message}`);
    }
  };

  const handleCompact = () => {
    try {
      saveSnapshot();
      const obj = evalToJson(input);
      setOutput(JSON.stringify(obj));
    } catch (e) {
      setOutput(`⚠️ 压缩错误：${e.message}`);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [...r, { input, output }]);
    setInput(prev.input);
    setOutput(prev.output);
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, { input, output }]);
    setInput(next.input);
    setOutput(next.output);
    setRedoStack((r) => r.slice(0, -1));
  };

  // 尝试支援修复非 JSON 格式（例如：单引号、JSONP、无引号 key）
  const evalToJson = (text) => {
    const cleaned = text
      .replace(/\/\/.*$/gm, '')              // 移除单行注解
      .replace(/\/\*[\s\S]*?\*\//g, '')      // 移除多行注解
      .replace(/^\s*[\w$]+\s*\(\s*/, '')     // 去除 JSONP 函式开头
      .replace(/\);\s*$/, '');               // 去除 JSONP 结尾
    return eval(`(${cleaned})`);
  };

  return (
    <div
      className={`max-w-7xl mx-auto p-4 transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-2xl font-bold text-center mb-4">
        JSON 处理工具
      </h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* 左边输入 */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请贴上或输入 JSON"
          className={`w-full md:w-1/2 h-[400px] p-3 rounded border resize-none font-mono text-sm transition-colors ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-gray-100 border-gray-300 text-black'
          }`}
        />

        {/* 右边输出 */}
        <textarea
          value={output}
          readOnly
          className={`w-full md:w-1/2 h-[400px] p-3 rounded border resize-none font-mono text-sm transition-colors ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-green-300'
              : 'bg-gray-100 border-gray-300 text-gray-800'
          }`}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button onClick={handleFormat} className="btn-blue">格式化 (Ctrl+L)</button>
        <button onClick={handleCompact} className="btn-blue">压缩 (Ctrl+Shift+L)</button>
        <button onClick={handleUndo} className="btn-gray">上一步</button>
        <button onClick={handleRedo} className="btn-gray">下一步</button>
      </div>

      <style jsx>{`
        .btn-blue {
          background: #2563eb;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn-blue:hover {
          background: #1d4ed8;
        }
        .btn-gray {
          background: #6b7280;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn-gray:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}
