import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

type Priority = 'high' | 'normal' | 'low';
type Filter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  due: string | null;
  createdAt: number;
}

const LS_KEY = 'todo-items-v1';
const SEED_IF_EMPTY = true;

const uid = (): string =>
  (typeof crypto !== 'undefined' && (crypto as any).randomUUID?.()) ||
  `id-${Math.random().toString(36).slice(2)}`;

function useLocalStorageState<T>(
  key: string,
  initializer: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initializer();
      const raw = window.localStorage.getItem(key);
      if (!raw) return initializer();
      const parsed = JSON.parse(raw);
      return parsed as T;
    } catch {
      return initializer();
    }
  });

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 寫入錯誤
    }
  }, [key, value]);

  return [value, setValue];
}

export default function TodoList() {
  const { darkMode } = useDarkMode();

  const [items, setItems] = useLocalStorageState<Todo[]>(LS_KEY, () => {
    const sample: Todo[] = [
      {
        id: uid(),
        title: '編輯、完成、拖曳可排序',
        completed: false,
        createdAt: Date.now(),
        priority: 'normal',
        due: null,
      },
    ];
    return SEED_IF_EMPTY ? sample : [];
  });

  useEffect(() => {
    if (SEED_IF_EMPTY && Array.isArray(items) && items.length === 0) {
      setItems([
        {
          id: uid(),
          title: '範例待辦',
          completed: false,
          createdAt: Date.now(),
          priority: 'normal',
          due: null,
        },
      ]);
    }
  }, []);

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPrio, setNewPrio] = useState<Priority>('normal');
  const [newDue, setNewDue] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- 派生清單 ---
  const filtered = useMemo<Todo[]>(() => {
    const q = search.trim().toLowerCase();
    let arr = items;
    if (filter === 'active') arr = arr.filter((i) => !i.completed);
    if (filter === 'completed') arr = arr.filter((i) => i.completed);
    if (q) arr = arr.filter((i) => i.title.toLowerCase().includes(q));
    return arr;
  }, [items, filter, search]);

  const addItem = (): void => {
    const title = newTitle.trim();
    if (!title) return;
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        title,
        completed: false,
        priority: newPrio,
        due: newDue || null,
        createdAt: Date.now(),
      },
    ]);
    setNewTitle('');
  };

  const updateItem = (id: string, patch: Partial<Todo>): void => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const removeItem = (id: string): void => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCompleted = (): void => {
    setItems((prev) => prev.filter((i) => !i.completed));
  };

  const toggleAll = (): void => {
    setItems((prev) => {
      const anyActive = prev.some((i) => !i.completed);
      return prev.map((i) => ({ ...i, completed: anyActive }));
    });
  };

  const moveByDelta = (id: string, delta: number): void => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const nidx = Math.max(0, Math.min(prev.length - 1, idx + delta));
      if (nidx === idx) return prev;
      const copy = prev.slice();
      const [moved] = copy.splice(idx, 1);
      copy.splice(nidx, 0, moved);
      return copy;
    });
  };

  const reorder = (fromId: string, toId: string): void => {
    if (!fromId || !toId || fromId === toId) return;
    setItems((prev) => {
      const fromIdx = prev.findIndex((i) => i.id === fromId);
      const toIdx = prev.findIndex((i) => i.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const copy = prev.slice();
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  const exportJSON = (): void => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todos.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSONFile = (file: File | undefined | null): void => {
    if (!file) return;
    file
      .text()
      .then((text) => {
        const arr = JSON.parse(text);
        if (!Array.isArray(arr)) throw new Error('格式錯誤');
        const sanitized: Todo[] = arr.map((x: any) => ({
          id: String(x.id || uid()),
          title: String(x.title || '').slice(0, 500),
          completed: !!x.completed,
          createdAt: Number(x.createdAt || Date.now()),
          priority: (['high', 'normal', 'low'] as Priority[]).includes(
            x.priority
          )
            ? x.priority
            : 'normal',
          due: x.due || null,
        }));
        setItems(sanitized);
      })
      .catch((e) => alert('匯入失敗：' + (e as Error).message));
  };

  const btnNeutral = `px-3 py-2 rounded-lg border transition-colors ${
    darkMode
      ? 'bg-slate-800 border-white/10 text-slate-100 hover:bg-slate-700'
      : 'bg-slate-100 border-black/10 text-slate-900 hover:bg-slate-200'
  }`;
  const btnDanger = `px-3 py-2 rounded-lg border transition-colors ${
    darkMode
      ? 'bg-transparent border-rose-400/30 text-rose-200 hover:bg-rose-500/10'
      : 'bg-white border-rose-300 text-rose-600 hover:bg-rose-50'
  }`;

  return (
    <div
      className={`max-w-5xl mx-auto p-4 space-y-8 transition-colors ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xl font-extrabold">
          React Todo
        </div>
        <div className="flex gap-2">
          <button onClick={exportJSON} className={btnNeutral}>
            匯出 JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={btnNeutral}
          >
            匯入 JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => importJSONFile(e.target.files?.[0])}
          />
          <button onClick={clearCompleted} className={btnDanger}>
            清除已完成
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_110px] gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="輸入待辦事項，按 Enter 或點『新增』"
          className={`w-full rounded-xl border px-4 py-4 text-lg outline-none ${
            darkMode
              ? 'bg-slate-900 border-white/10'
              : 'bg-white border-black/10'
          }`}
        />
        <select
          value={newPrio}
          onChange={(e) => setNewPrio(e.target.value as Priority)}
          className={`rounded-xl border px-3 py-3 ${
            darkMode
              ? 'bg-slate-900 border-white/10'
              : 'bg-white border-black/10'
          }`}
        >
          <option value="normal">普通</option>
          <option value="high">高</option>
          <option value="low">低</option>
        </select>
        <input
          type="date"
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
          className={`rounded-xl border px-3 py-3 ${
            darkMode
              ? 'bg-slate-900 border-white/10'
              : 'bg-white border-black/10'
          }`}
        />
        <button
          onClick={addItem}
          className="rounded-xl px-4 py-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          新增
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
        <div
          className={`flex gap-1 p-1 rounded-full ${
            darkMode ? 'bg-slate-900' : 'bg-slate-100'
          }`}
        >
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'active' ? '未完成' : '已完成'}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="搜尋..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 rounded-lg border px-3 py-2 ${
            darkMode
              ? 'bg-slate-900 border-white/10'
              : 'bg-white border-black/10'
          }`}
        />
      </div>

      <ul className="grid gap-2">
        {filtered.map((item) => (
          <TodoItem
            key={item.id}
            item={item}
            dark={darkMode}
            onToggle={() => updateItem(item.id, { completed: !item.completed })}
            onRemove={() => removeItem(item.id)}
            onUpdate={(patch) => updateItem(item.id, patch)}
            onMoveUp={() => moveByDelta(item.id, -1)}
            onMoveDown={() => moveByDelta(item.id, +1)}
            onReorder={reorder}
          />
        ))}
      </ul>

      <div
        className={`flex items-center justify-between text-sm ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        <div>
          共{' '}
          <strong className={`${darkMode ? 'text-white' : 'text-black'}`}>
            {items.length}
          </strong>{' '}
          筆， 未完成{' '}
          <strong className={`${darkMode ? 'text-white' : 'text-black'}`}>
            {items.filter((i) => !i.completed).length}
          </strong>{' '}
          筆
        </div>
        <div className="flex gap-2">
          <button onClick={toggleAll} className={btnNeutral}>
            全部切換完成/未完成
          </button>
          <button
            onClick={() => {
              if (!confirm('重置並載入範例資料？')) return;
              setItems([
                {
                  id: uid(),
                  title: '學會 PHP：做一個 /notes API',
                  completed: true,
                  createdAt: Date.now() - 86400000 * 2,
                  priority: 'high',
                  due: null,
                },
                {
                  id: uid(),
                  title: '把 Todo 存到 localStorage',
                  completed: false,
                  createdAt: Date.now() - 86400000,
                  priority: 'normal',
                  due: new Date(Date.now() + 86400000)
                    .toISOString()
                    .slice(0, 10),
                },
                {
                  id: uid(),
                  title: '拖曳排序 + 編輯/刪除',
                  completed: false,
                  createdAt: Date.now(),
                  priority: 'low',
                  due: null,
                },
              ]);
            }}
            className={btnNeutral}
          >
            重置範例資料
          </button>
        </div>
      </div>
    </div>
  );
}

function TodoItem(props: {
  item: Todo;
  dark: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Todo>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onReorder: (fromId: string, toId: string) => void;
}) {
  const {
    item,
    dark,
    onToggle,
    onRemove,
    onUpdate,
    onMoveUp,
    onMoveDown,
    onReorder,
  } = props;

  const [editing, setEditing] = useState<boolean>(false);
  const [t, setT] = useState<string>(item.title);
  const [p, setP] = useState<Priority>(item.priority || 'normal');
  const [d, setD] = useState<string>(item.due || '');

  useEffect(() => {
    setT(item.title);
    setP(item.priority || 'normal');
    setD(item.due || '');
  }, [item.id]);

  const metaText = (): string => {
    const parts: string[] = [];
    if (p === 'high') parts.push('⚡ 高優先');
    if (p === 'low') parts.push('⬇︎ 低優先');
    if (d) parts.push('⏰ ' + d);
    return parts.join(' · ');
  };

  const onDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-400');
  };
  const onDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
  };
  const onDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
    const fromId = e.dataTransfer.getData('text/plain');
    onReorder(fromId, item.id);
  };

  return (
    <li
      className={`grid grid-cols-[28px_28px_1fr_auto] items-center gap-2 rounded-xl border p-2 ${
        dark ? 'bg-slate-900 border-white/10' : 'bg-white border-black/10'
      } ${item.completed ? 'opacity-90' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        title="按住拖曳排序"
        className="select-none cursor-grab text-slate-400"
      >
        ⋮⋮
      </div>

      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        title="切換完成"
        className="size-5"
      />

      <div className="grid gap-1">
        {!editing ? (
          <>
            <div
              className={`px-2 py-1 rounded ${
                item.completed ? 'line-through text-slate-400' : ''
              }`}
            >
              {item.title}
            </div>
            <div className="text-xs text-slate-400">{metaText()}</div>
          </>
        ) : (
          <div className="grid md:grid-cols-[1fr_110px_120px_auto] grid-cols-1 gap-2">
            <input
              value={t}
              onChange={(e) => setT(e.target.value)}
              placeholder="編輯內容…"
              className={`rounded-lg border px-3 py-2 ${
                dark
                  ? 'bg-slate-950 border-white/10'
                  : 'bg-white border-black/10'
              }`}
            />
            <select
              value={p}
              onChange={(e) => setP(e.target.value as Priority)}
              className={`rounded-lg border px-3 py-2 ${
                dark
                  ? 'bg-slate-950 border-white/10'
                  : 'bg-white border-black/10'
              }`}
            >
              <option value="normal">普通</option>
              <option value="high">高</option>
              <option value="low">低</option>
            </select>
            <input
              type="date"
              value={d}
              onChange={(e) => setD(e.target.value)}
              className={`rounded-lg border px-3 py-2 ${
                dark
                  ? 'bg-slate-950 border-white/10'
                  : 'bg-white border-black/10'
              }`}
            />
            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => {
                  const title = t.trim();
                  if (!title) return alert('內容不可為空');
                  onUpdate({ title, priority: p, due: d || null });
                  setEditing(false);
                }}
              >
                💾 儲存
              </button>
              <button
                className={`px-3 py-2 rounded-lg border ${
                  dark ? 'border-white/10' : 'border-black/10'
                }`}
                onClick={() => {
                  setEditing(false);
                  setT(item.title);
                  setP(item.priority || 'normal');
                  setD(item.due || '');
                }}
              >
                ✖️ 取消
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!editing && (
          <button
            className={`px-2 py-1 rounded-lg border ${
              dark ? 'border-white/10' : 'border-black/10'
            }`}
            onClick={() => setEditing(true)}
          >
            ✏️
          </button>
        )}
        <button
          className={`px-2 py-1 rounded-lg border ${
            dark
              ? 'border-white/10 text-rose-300'
              : 'border-black/10 text-rose-600'
          }`}
          onClick={onRemove}
        >
          🗑️
        </button>

        <button
          className={`px-2 py-1 rounded-lg border ${
            dark ? 'border-white/10' : 'border-black/10'
          }`}
          onClick={onMoveUp}
          title="上移"
        >
          ⬆️
        </button>
        <button
          className={`px-2 py-1 rounded-lg border ${
            dark ? 'border-white/10' : 'border-black/10'
          }`}
          onClick={onMoveDown}
          title="下移"
        >
          ⬇️
        </button>
      </div>
    </li>
  );
}
