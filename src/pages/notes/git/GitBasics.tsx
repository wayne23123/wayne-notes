import React, { useState } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

const GitBasics = () => {
  const { darkMode } = useDarkMode();
  const [copiedCommandId, setCopiedCommandId] = useState<string | null>(null);
  // 搜尋功能
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const gitCommands = [
    {
      id: 'clone',
      command: 'git clone <repository-url>',
      description: '複製遠程倉庫',
    },
    { id: 'init', command: 'git init', description: '初始化本地倉庫' },
    { id: 'add', command: 'git add <file>', description: '將更改加入暫存區' },
    {
      id: 'commit',
      command: 'git commit -m "<message>"',
      description: '提交更改到本地倉庫',
    },
    {
      id: 'push',
      command: 'git push <remote> <branch>',
      description: '推送更改到遠程倉庫',
    },
    {
      id: 'pull',
      command: 'git pull <remote> <branch>',
      description: '從遠程倉庫拉取最新更改',
    },
  ];

  const filteredCommands = gitCommands.filter((cmd) =>
    cmd.command.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 複製功能
  const handleCopy = (commandId: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCommandId(commandId);
      setTimeout(() => setCopiedCommandId(null), 2000);
    });
  };

  // 處理滾動
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // 使滾動稍微位移，避免被固定導航欄遮住
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 ">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* 內容區 */}
        <div className="flex-1 pr-6">
          {/* Git 指令列表 */}
          <div>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
              }`}
            >
              常用 Git 指令
            </h2>

            <ul className="space-y-4">
              {filteredCommands.map((command) => (
                <li
                  key={command.id}
                  id={command.id}
                  className={`p-4 border-b shadow-sm rounded ${
                    darkMode
                      ? 'border-gray-600 bg-gray-800'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {/* 指令標題 */}
                  <h4
                    className={`font-bold text-xl ${
                      darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
                    }`}
                  >
                    {command.command}
                  </h4>

                  {/* 指令描述 */}
                  <p
                    className={`mb-4 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {command.description}
                  </p>

                  {/* 指令區塊 */}
                  <div className="rounded overflow-hidden">
                    <div
                      className={`text-right p-2 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => handleCopy(command.id, command.command)}
                        className={`copy-button px-4 rounded ${
                          darkMode
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-700 text-white'
                        }`}
                      >
                        {copiedCommandId === command.id ? '✓ 已複製' : '❐ 複製'}
                      </button>
                    </div>

                    {/* 指令顯示區塊 */}
                    <pre
                      className={`p-2 rounded ${
                        darkMode
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-black'
                      }`}
                    >
                      <code>{command.command}</code>
                    </pre>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 快速導覽區 */}
        <div
          className={`lg:w-1/3 lg:block hidden sticky top-6 p-4 rounded-lg shadow-lg ${
            darkMode ? 'bg-[#1f1f1f]' : 'bg-gray-100'
          }`}
        >
          {/* 搜尋框 */}
          <div className="relative mb-6">
            <span
              className={`absolute inset-y-0 left-3 flex items-center ${
                darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
              }`}
            >
              🔍
            </span>

            {/* 搜尋輸入框 */}
            <input
              type="text"
              placeholder="搜尋"
              className={`pl-10 pr-4 py-3 w-full border rounded-lg shadow-md focus:outline-none transition ${
                darkMode
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white text-black'
              }`}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <ul className="space-y-2">
            {gitCommands.map((command) => (
              <li key={command.id}>
                <button
                  onClick={() => handleScrollTo(command.id)}
                  className={`hover:underline ${
                    darkMode ? 'text-[#62FFFC]' : 'text-blue-800'
                  }`}
                >
                  {command.command}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GitBasics;
