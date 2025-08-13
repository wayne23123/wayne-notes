import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

type MimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif'
  | 'image/svg+xml';

const EXT_MAP: Record<MimeType, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

// 1x1 PNG 黑點（純 Base64，無 data: 前綴）
const SAMPLE_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAA' +
  'AAC0lEQVR42mP8/x8AAwMCAO1lMcoAAAAASUVORK5CYII=';

function buildDataUrl(input: string, fallbackMime: MimeType): string {
  const raw = (input || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:')) return raw;
  return `data:${fallbackMime};base64,${raw}`;
}

function estimateBytesFromBase64(dataUrlOrRaw: string): number | null {
  const raw = dataUrlOrRaw.startsWith('data:')
    ? dataUrlOrRaw.split(',').pop() || ''
    : dataUrlOrRaw.trim();
  if (!raw) return null;
  const padding = raw.endsWith('==') ? 2 : raw.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((raw.length * 3) / 4) - padding);
}

function humanSize(bytes: number | null): string {
  if (!Number.isFinite(bytes!) || bytes === null) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const digits = n < 10 && i > 0 ? 2 : 0;
  return `${n.toFixed(digits)} ${units[i]}`;
}

export default function SvgPreviewTool() {
  const { darkMode } = useDarkMode();

  const [b64, setB64] = useState<string>('');
  const [mime, setMime] = useState<MimeType>('image/png');
  const [filename, setFilename] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>(''); // 預覽用
  const [status, setStatus] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dim, setDim] = useState<{ w: number | null; h: number | null }>({
    w: null,
    h: null,
  });

  // 自動推導顯示用的 MIME（優先使用 dataURL 的實際類型）
  const effectiveMime: string = useMemo(() => {
    if (!dataUrl) return mime;
    const m = /^data:([^;]+);base64,/i.exec(dataUrl)?.[1];
    return m || mime;
  }, [dataUrl, mime]);

  const approxBytes = useMemo(() => estimateBytesFromBase64(dataUrl || b64), [dataUrl, b64]);

  // 預覽
  const preview = () => {
    setStatus('');
    setDim({ w: null, h: null });

    const url = buildDataUrl(b64, mime);
    if (!url) {
      setDataUrl('');
      setStatus('請貼上 Base64 內容');
      return;
    }
    setDataUrl(url);
  };

  // 清空
  const handleClear = () => {
    setB64('');
    setFilename('');
    setDataUrl('');
    setDim({ w: null, h: null });
    setStatus('');
  };

  // 範例
  const loadSample = () => {
    setB64(SAMPLE_PNG_BASE64);
    setMime('image/png');
    setFilename('sample.png');
    setStatus('');
    // 立即預覽
    setTimeout(preview, 0);
  };

  // 下載
  const handleDownload = () => {
    const url = buildDataUrl(b64, mime);
    if (!url) {
      setStatus('沒有可下載的內容');
      return;
    }
    const a = document.createElement('a');
    const def = `image.${EXT_MAP[mime]}`;
    a.download = (filename || def).trim();
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus('已觸發下載');
  };

  // 複製 Data URL
  const handleCopyDataUrl = async () => {
    const url = buildDataUrl(b64, mime);
    if (!url) {
      setStatus('沒有可複製的內容');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setStatus('已複製 Data URL 到剪貼簿');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setStatus('複製失敗：瀏覽器權限不允許');
    }
  };

  // 圖片載入結果
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const onLoad = () => {
      setDim({ w: img.naturalWidth, h: img.naturalHeight });
      setStatus('載入成功');
    };
    const onError = () => {
      setDim({ w: null, h: null });
      setStatus('載入失敗：請確認 Base64 與 MIME 類型是否正確');
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    return () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
  }, [dataUrl]);

  // 輸入時 500ms 自動預覽（簡易 debounce）
  useEffect(() => {
    const t = setTimeout(() => {
      if (b64.trim()) preview();
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b64, mime]);

  return (
    <div
      className={`max-w-5xl mx-auto p-6 space-y-6 transition-colors min-h-screen ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-xl font-semibold">
        Base64 圖片預覽器{' '}
        <span
          className={`ml-2 rounded-full border px-2 py-0.5 text-xs ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'
          }`}
        >
          貼上 Base64 → 預覽 / 下載
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左側：輸入與操作 */}
          <div>
            <label htmlFor="b64" className="text-sm text-gray-500 dark:text-gray-400">
              Base64 內容（可含或不含 <code>data:</code> 前綴）
            </label>
            <textarea
              id="b64"
              className={`mt-1 w-full min-h-[140px] resize-y rounded-lg border p-3 outline-none ${
                darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-black'
              }`}
              placeholder="例如：data:image/png;base64,iVBORw0KGgo... 或純 Base64"
              value={b64}
              onChange={(e) => setB64(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={preview}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                預覽
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                清空
              </button>
              <button
                type="button"
                onClick={loadSample}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                載入範例
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              若沒有 <code>data:</code> 前綴，會以右側選擇的 MIME 類型自動補上。
            </p>
          </div>

          {/* 右側：MIME / 下載 / 複製 */}
          <div>
            <label htmlFor="mime" className="text-sm text-gray-500 dark:text-gray-400">
              MIME 類型
            </label>
            <select
              id="mime"
              className={`mt-1 w-full rounded-lg border p-2 ${
                darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-black'
              }`}
              value={mime}
              onChange={(e) => setMime(e.target.value as MimeType)}
            >
              <option value="image/png">image/png（.png）</option>
              <option value="image/jpeg">image/jpeg（.jpg）</option>
              <option value="image/webp">image/webp（.webp）</option>
              <option value="image/gif">image/gif（.gif）</option>
              <option value="image/svg+xml">image/svg+xml（.svg）</option>
            </select>

            <label htmlFor="filename" className="mt-3 block text-sm text-gray-500 dark:text-gray-400">
              檔名（下載用，可留空）
            </label>
            <input
              id="filename"
              type="text"
              className={`mt-1 w-full rounded-lg border p-2 outline-none ${
                darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-black'
              }`}
              placeholder={`例如：image.${EXT_MAP[mime]}`}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                下載圖片
              </button>
              <button
                type="button"
                onClick={handleCopyDataUrl}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                複製 Data URL {copied ? '✅' : ''}
              </button>
            </div>

            <div
              className={`mt-2 text-xs ${
                status.includes('失敗') ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'
              }`}
              aria-live="polite"
            >
              {status}
            </div>
          </div>
        </div>

        {/* 預覽區 */}
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">預覽</label>
          <div
            className={`mt-1 flex min-h-[260px] items-center justify-center rounded-xl border ${
              darkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'
            } p-3`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              id="img"
              alt="預覽區"
              src={dataUrl || undefined}
              className="max-h-[60vh] max-w-full rounded-md"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>類型：{effectiveMime || '—'}</span>
            <span>大小：約 {humanSize(approxBytes)}</span>
            <span>
              尺寸：{dim.w && dim.h ? `${dim.w} × ${dim.h}` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
