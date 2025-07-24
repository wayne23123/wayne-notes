import { useEffect, useState, useRef } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function JsonTool() {
  const { darkMode } = useDarkMode();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState<{ input: string; output: string }[]>(
    []
  );

  const [redoStack, setRedoStack] = useState<
    { input: string; output: string }[]
  >([]);
  const inputRef = useRef(null);

  // 初始載入 localStorage
  useEffect(() => {
    const savedInput = localStorage.getItem('json_input') || '';
    const savedOutput = localStorage.getItem('json_output') || '';
    setInput(savedInput);
    setOutput(savedOutput);
  }, []);

  // 寫入 localStorage
  useEffect(() => {
    localStorage.setItem('json_input', input);
    localStorage.setItem('json_output', output);
  }, [input, output]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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
  }, []);

  // 快照儲存
  const saveSnapshot = () => {
    setHistory((prev) => [...prev, { input, output }]);
    setRedoStack([]);
  };

  const handleFormat = () => {
    try {
      saveSnapshot();
      const obj = evalToJson(input); // 支援非純 JSON 格式
      setOutput(JSON.stringify(obj, null, 2));
    } catch (e) {
      if (e instanceof Error) {
        setOutput(`⚠️ 格式錯誤：${e.message}`);
      } else {
        setOutput('⚠️ 格式錯誤：未知例外');
      }
    }
  };

  const handleCompact = () => {
    try {
      saveSnapshot();
      const obj = evalToJson(input);
      setOutput(JSON.stringify(obj));
    } catch (e) {
      if (e instanceof Error) {
        setOutput(`⚠️ 壓縮錯誤：${e.message}`);
      } else {
        setOutput('⚠️ 壓縮錯誤：未知例外');
      }
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

  // 嘗試支援修復非 JSON 格式（例如：單引號、JSONP、無引號 key）
  const evalToJson = (text: string): any => {
    const cleaned = text
      .replace(/\/\/.*$/gm, '') // 移除單行註解
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行註解
      .replace(/^\s*[\w$]+\s*\(\s*/, '') // 移除 JSONP 開頭
      .replace(/\);\s*$/, ''); // 移除 JSONP 結尾
    return eval(`(${cleaned})`);
  };

  // 遞迴排序 JSON key
  const sortJson = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(sortJson);
    } else if (value !== null && typeof value === 'object') {
      const sorted: { [key: string]: any } = {};
      Object.keys(value)
        .sort()
        .forEach((key) => {
          sorted[key] = sortJson(value[key]);
        });
      return sorted;
    }
    return value;
  };

  const handleSort = () => {
    try {
      saveSnapshot();
      const obj = evalToJson(input);
      const sorted = sortJson(obj);
      setOutput(JSON.stringify(sorted, null, 2));
    } catch (e) {
      if (e instanceof Error) {
        setOutput(`⚠️ 排序錯誤：${e.message}`);
      } else {
        setOutput('⚠️ 排序錯誤：未知例外');
      }
    }
  };

  return (
    <div
      className={`max-w-7xl mx-auto p-4 transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-2xl font-bold text-center mb-4">JSON 處理工具</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* 左邊輸入 */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="請貼上或輸入 JSON"
          className={`w-full md:w-1/2 h-[400px] p-3 rounded border resize-none font-mono text-sm transition-colors ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-gray-100 border-gray-300 text-black'
          }`}
        />

        {/* 右邊輸出 */}
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
        <button onClick={handleSort} className="btn-blue">
          排序 JSON Keys
        </button>

        <button onClick={handleFormat} className="btn-blue">
          格式化 (Ctrl+L)
        </button>
        <button onClick={handleCompact} className="btn-blue">
          壓縮 (Ctrl+Shift+L)
        </button>
        <button onClick={handleUndo} className="btn-gray">
          上一步
        </button>
        <button onClick={handleRedo} className="btn-gray">
          下一步
        </button>
      </div>

      {/* <style>{`
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
      `}</style> */}
    </div>
  );
}
