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

    {
      id: 'fetch',
      command: 'git fetch --all',
      description: '獲取遠端分支更新（不會合並）',
    },

    {
      id: 'local-branches',
      command: 'git branch',
      description: '查看本地分支',
    },
    {
      id: 'remote-branches',
      command: 'git branch -r',
      description: '查看遠端倉庫的所有分支',
    },
    {
      id: 'all-branches',
      command: 'git branch -a',
      description: '查看本地和遠端的所有分支',
    },

    {
      id: 'switch-branch',
      command: 'git checkout <branch>',
      description: '切換到指定分支',
    },
    {
      id: 'create-and-switch',
      command: 'git checkout -b <new-branch> <remote-branch>',
      description: '從遠端分支創建本地分支並切換',
    },
    {
      id: 'switch-new',
      command: 'git switch --track <remote>/<branch>',
      description: '（Git 2.23+）直接切換到遠端分支',
    },

    {
      id: 'update-develop',
      command: 'git checkout develop && git pull origin develop',
      description: '切換到 develop 並更新遠端最新變更',
    },

    {
      id: 'merge-develop',
      command: 'git checkout <feature-branch> && git merge develop',
      description: '將 develop 分支合併到當前分支',
    },

    {
      id: 'push-feature',
      command: 'git push origin <feature-branch>',
      description: '推送 feature 分支到遠端',
    },

    {
      id: 'create-pr',
      command: '在 GitHub/GitLab 創建 Pull Request',
      description: '發送 PR，選擇 `base: develop`，`compare: feature-branch`',
    },

    {
      id: 'update-pr',
      command:
        'git add . && git commit -m "Fix: ..." && git push origin <feature-branch>',
      description: '在 PR 期間修改內容並推送更新',
    },

    {
      id: 'switch-main',
      command: 'git checkout main',
      description: '切換回 main 分支',
    },
    {
      id: 'fetch-main',
      command: 'git checkout -b main origin/main',
      description: '如果本地沒有 main，從遠端創建並切換',
    },

    {
      id: 'install',
      command: 'nvm install <version>',
      description: '安裝指定版本的 Node.js',
    },
    {
      id: 'uninstall',
      command: 'nvm uninstall <version>',
      description: '移除指定版本的 Node.js',
    },
    {
      id: 'use',
      command: 'nvm use <version>',
      description: '切換至指定版本的 Node.js',
    },
    {
      id: 'list',
      command: 'nvm list',
      description: '列出已安裝的 Node.js 版本',
    },
    {
      id: 'current',
      command: 'nvm current',
      description: '顯示目前使用中的 Node.js 版本',
    },
    {
      id: 'alias',
      command: 'nvm alias <name> <version>',
      description: '為特定版本建立別名',
    },
    {
      id: 'unalias',
      command: 'nvm unalias <name>',
      description: '刪除指定的別名',
    },
    {
      id: 'list-remote',
      command: 'nvm list-remote',
      description: '列出所有可用的 Node.js 版本',
    },
    {
      id: 'exec',
      command: 'nvm exec <version> <command>',
      description: '使用特定版本執行指令',
    },
    {
      id: 'run',
      command: 'nvm run <version> <file.js>',
      description: '使用特定版本執行 JavaScript 檔案',
    },
    {
      id: 'which',
      command: 'nvm which <version>',
      description: '顯示指定版本的 Node.js 安裝路徑',
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
          className={`lg:w-1/3 lg:block hidden sticky top-16 p-4 rounded-lg shadow-lg self-start ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
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
