import { useState } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

const JsonStringifyInterview = () => {
  const { darkMode } = useDarkMode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const questions = [
    {
      id: 'usage',
      question: 'JSON.stringify() 的主要用途是什麼？',
      navigation: 'stringify() 的主要用途',
      answer: `JSON.stringify() 用於將 JavaScript 對象轉換為 JSON 格式的字符串，主要應用場景：
1. 存儲數據到 localStorage / sessionStorage
2. 在 API 請求中傳遞 JSON 數據
3. 進行簡單的深拷貝（但有侷限性）
4. 美化 JSON 讓數據易讀`,
    },
    {
      id: 'null-undefined',
      question: 'JSON.stringify() 如何處理 null 和 undefined？',
      navigation: '如何處理 null 和 undefined',
      answer: `- null 會被正常序列化為 "null"
- undefined 在對象中會被刪除，在數組中會變成 null
- 單獨序列化 undefined 會返回 "undefined"`,
      code: `console.log(JSON.stringify({ a: null, b: undefined })); // '{"a":null}'
console.log(JSON.stringify([null, undefined])); // '[null,null]'
console.log(JSON.stringify(undefined)); // 'undefined'`,
    },
    {
      id: 'deep-copy',
      question: 'JSON.stringify() 可以用來做深拷貝嗎?',
      navigation: '可以用來做深拷貝嗎?',
      answer: `可以，但有侷限：
- 無法拷貝函數、Symbol、Set、Map
- 不能處理循環引用（會報錯）
- NaN / Infinity 會變成 null
如果需要更完整的深拷貝，可以使用 structuredClone() 或 lodash.cloneDeep()。`,
      code: `const obj = { name: "Alice", nested: { age: 25 } };
const copy = JSON.parse(JSON.stringify(obj));

console.log(copy === obj); // false （不同對象）
console.log(copy.nested === obj.nested); // false （內部對象也不同）`,
    },
    {
      id: 'circular-reference',
      question: 'JSON.stringify() 為什麼會遇到循環引用報錯？',
      navigation: '為什麼會遇到循環引用報錯?',
      answer: `因為 JSON 是樹狀結構，不能處理循環引用。
如果對象的某個屬性指向自身，JSON.stringify() 會陷入無窮遞歸，導致報錯：
TypeError: Converting circular structure to JSON`,
      code: `const obj = { name: "Alice" };
obj.self = obj; // 循環引用
JSON.stringify(obj); // 直接報錯`,
    },
  ];

  // 搜尋過濾
  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 複製代碼
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  // 滾動到指定問題
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // 避免被固定導航欄遮住
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:flex lg:gap-6">
      {/* 文章內容 */}
      <div className="lg:w-2/3">
        <h2
          className={`text-3xl font-bold text-center mb-6 ${
            darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
          }`}
        >
          JSON.stringify()
        </h2>

        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            id={q.id}
            className={`p-4 rounded-lg shadow mb-6 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            <h3 className="font-bold text-lg mb-2">{q.question}</h3>
            <p className="whitespace-pre-line">{q.answer}</p>

            {q.code && (
              <>
                <div
                  className={`text-right p-2 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleCopy(q.code)}
                    className={`copy-button px-4 rounded ${
                      darkMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-700 text-white'
                    }`}
                  >
                    {copiedCode === q.code ? '✓ 已複製' : '❐ 複製'}
                  </button>
                </div>

                <pre
                  className={`p-4 rounded-lg text-left overflow-auto ${
                    darkMode
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  <code>{q.code}</code>
                </pre>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 快速導覽 */}
      <div
        className={`lg:w-1/3 lg:block hidden sticky top-16 p-4 rounded-lg shadow-lg self-start ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        {/* 搜尋框 */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="search"
            className={`w-full p-3 border rounded-lg shadow-md focus:outline-none transition ${
              darkMode
                ? 'border-gray-600 bg-gray-800 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id}>
              <button
                onClick={() => handleScrollTo(q.id)}
                className={`hover:underline ${
                  darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
                }`}
              >
                {q.navigation}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JsonStringifyInterview;
