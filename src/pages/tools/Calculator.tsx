import { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

// ============ 型別 ============
type AngleMode = 'RAD' | 'DEG';
type TokenType =
  | 'num'
  | 'op'
  | 'lparen'
  | 'rparen'
  | 'comma'
  | 'ident'
  | 'const'
  | 'postfix'
  | 'unary';
type Assoc = 'L' | 'R';
type OpDef = {
  prec: number;
  assoc: Assoc;
  arity: 2 | 1;
  kind: 'binary' | 'unary' | 'postfix';
  fn: (...args: number[]) => number;
};
type FnDef = { arity: number | 'var'; fn: (...args: number[]) => number };

interface HistoryItem {
  id: string;
  expr: string;
  result: number;
  t: number;
}
interface ParseToken {
  type: TokenType;
  value?: string | number;
}

// ============ 工具 ============
const uid = () =>
  (typeof crypto !== 'undefined' && (crypto as any).randomUUID?.()) ||
  `id-${Math.random().toString(36).slice(2)}`;

// 角度轉換
const toRad = (x: number, mode: AngleMode) =>
  mode === 'DEG' ? (x * Math.PI) / 180 : x;
const fromRad = (x: number, mode: AngleMode) =>
  mode === 'DEG' ? (x * 180) / Math.PI : x;

// 階乘（僅支援 0..170 間整數）
function factorial(n: number): number {
  if (!Number.isFinite(n)) throw new Error('factorial: 非有限數');
  if (n < 0) throw new Error('factorial: 負數無定義');
  if (Math.floor(n) !== n) throw new Error('factorial: 僅支援整數');
  if (n > 170) throw new Error('factorial: 太大可能溢位');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ============ 運算子與函數定義 ============
function makeEnv(angleMode: AngleMode) {
  const OPS: Record<string, OpDef> = {
    // 二元
    '+': { prec: 2, assoc: 'L', arity: 2, kind: 'binary', fn: (a, b) => a + b },
    '-': { prec: 2, assoc: 'L', arity: 2, kind: 'binary', fn: (a, b) => a - b },
    '*': { prec: 3, assoc: 'L', arity: 2, kind: 'binary', fn: (a, b) => a * b },
    '/': { prec: 3, assoc: 'L', arity: 2, kind: 'binary', fn: (a, b) => a / b },
    '%': { prec: 3, assoc: 'L', arity: 2, kind: 'binary', fn: (a, b) => a % b }, // 餘數
    '^': {
      prec: 4,
      assoc: 'R',
      arity: 2,
      kind: 'binary',
      fn: (a, b) => Math.pow(a, b),
    },
    // 一元（前置）
    neg: { prec: 5, assoc: 'R', arity: 1, kind: 'unary', fn: (a) => -a },
    // 後置
    '!': {
      prec: 6,
      assoc: 'L',
      arity: 1,
      kind: 'postfix',
      fn: (a) => factorial(a),
    },
  } as const;

  const FNS: Record<string, FnDef> = {
    sin: { arity: 1, fn: (x) => Math.sin(toRad(x, angleMode)) },
    cos: { arity: 1, fn: (x) => Math.cos(toRad(x, angleMode)) },
    tan: { arity: 1, fn: (x) => Math.tan(toRad(x, angleMode)) },
    asin: { arity: 1, fn: (x) => fromRad(Math.asin(x), angleMode) },
    acos: { arity: 1, fn: (x) => fromRad(Math.acos(x), angleMode) },
    atan: { arity: 1, fn: (x) => fromRad(Math.atan(x), angleMode) },
    sqrt: { arity: 1, fn: (x) => Math.sqrt(x) },
    cbrt: { arity: 1, fn: (x) => Math.cbrt(x) },
    ln: { arity: 1, fn: (x) => Math.log(x) },
    log: { arity: 1, fn: (x) => Math.log10(x) },
    exp: { arity: 1, fn: (x) => Math.exp(x) },
    pow: { arity: 2, fn: (x, y) => Math.pow(x, y) },
    abs: { arity: 1, fn: (x) => Math.abs(x) },
    floor: { arity: 1, fn: (x) => Math.floor(x) },
    ceil: { arity: 1, fn: (x) => Math.ceil(x) },
    round: { arity: 1, fn: (x) => Math.round(x) },
    min: { arity: 'var', fn: (...xs) => Math.min(...xs) },
    max: { arity: 'var', fn: (...xs) => Math.max(...xs) },
    rand: { arity: 0 as any, fn: () => Math.random() },
    // 百分比：percent(50) = 0.5
    percent: { arity: 1, fn: (x) => x / 100 },
  } as const;

  const CONSTS: Record<string, number> = {
    pi: Math.PI,
    e: Math.E,
  } as const;

  return { OPS, FNS, CONSTS };
}

// ============ Tokenizer ============
function tokenize(src: string): ParseToken[] {
  const tokens: ParseToken[] = [];
  let i = 0;
  const isDigit = (c: string) => /[0-9]/.test(c);
  const isAlpha = (c: string) => /[a-zA-Z_]/.test(c);

  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n') {
      i++;
      continue;
    }
    if (c === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }
    if (c === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    // number: 123.45e-6 支援；另外支援後綴 % => 轉 percent()
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1] || ''))) {
      let j = i;
      let s = '';
      while (isDigit(src[j] || '')) {
        s += src[j++];
      }
      if (src[j] === '.') {
        s += src[j++];
        while (isDigit(src[j] || '')) s += src[j++];
      }
      if (src[j] === 'e' || src[j] === 'E') {
        let k = j;
        let seg = src[k];
        k++;
        if (src[k] === '+' || src[k] === '-') {
          seg += src[k++];
        }
        let anyDigit = false;
        while (isDigit(src[k] || '')) {
          seg += src[k++];
          anyDigit = true;
        }
        if (anyDigit) {
          s += seg;
          j = k;
        }
      }
      let num = Number(s);
      // 百分比後綴
      if (src[j] === '%') {
        num = num / 100;
        j++;
      }
      tokens.push({ type: 'num', value: num });
      i = j;
      continue;
    }

    // identifier
    if (isAlpha(c)) {
      let j = i,
        s = '';
      while (isAlpha(src[j] || '') || isDigit(src[j] || '')) s += src[j++];
      tokens.push({ type: 'ident', value: s.toLowerCase() });
      i = j;
      continue;
    }

    // operators
    if ('+-*/^%!'.includes(c)) {
      if (c === '!') tokens.push({ type: 'postfix', value: '!' });
      else tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }

    throw new Error(`未知字元: ${c}`);
  }
  return tokens;
}

// ============ Shunting-yard 轉 RPN ============
function toRPN(
  tokens: ParseToken[],
  env: ReturnType<typeof makeEnv>
): ParseToken[] {
  const { OPS, CONSTS } = env;
  const out: ParseToken[] = [];
  const stack: ParseToken[] = [];

  let prev: ParseToken | undefined = undefined;

  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];

    if (t.type === 'num') {
      out.push(t);
      prev = t;
      continue;
    }

    if (t.type === 'ident') {
      const v = String(t.value);
      if (v in CONSTS) {
        out.push({ type: 'num', value: CONSTS[v] });
        prev = out[out.length - 1];
        continue;
      }
      // 函數名稱
      out.push({ type: 'ident', value: v });
      stack.push({ type: 'lparen' }); // 假想一個 '(' 來處理單/多參數
      prev = t;
      continue;
    }

    if (t.type === 'comma') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen')
        out.push(stack.pop()!);
      if (!stack.length) throw new Error('逗號錯置');
      prev = t;
      continue;
    }

    if (t.type === 'lparen') {
      stack.push(t);
      prev = t;
      continue;
    }
    if (t.type === 'rparen') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen')
        out.push(stack.pop()!);
      if (!stack.length) throw new Error('括號不匹配');
      stack.pop(); // pop '('
      // 若上一個是函數，補上函數 token
      if (out.length && out[out.length - 1].type === 'ident') {
        // no-op, 等待參數結束時處理
      }
      prev = t;
      continue;
    }

    if (t.type === 'postfix') {
      // 直接進輸出（權重最高）
      out.push(t);
      prev = t;
      continue;
    }

    if (t.type === 'op') {
      let op = String(t.value);
      // unary minus: 在行首 / 前一個 token 是運算子或左括號時，視為 neg
      const isUnary =
        op === '-' &&
        (!prev || ['op', 'lparen', 'comma', 'unary'].includes(prev.type));
      if (isUnary) t = { type: 'unary', value: 'neg' };

      const currDef =
        t.type === 'unary' ? OPS['neg'] : OPS[op as keyof typeof OPS];
      if (!currDef) throw new Error(`未知運算子: ${op}`);

      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type !== 'op' && top.type !== 'unary' && top.type !== 'postfix')
          break;
        const topDef =
          top.type === 'unary'
            ? OPS['neg']
            : OPS[String(top.value) as keyof typeof OPS];
        if (!topDef) break;
        const cond =
          (currDef.assoc === 'L' && currDef.prec <= topDef.prec) ||
          (currDef.assoc === 'R' && currDef.prec < topDef.prec);
        if (cond) out.push(stack.pop()!);
        else break;
      }
      stack.push(t);
      prev = t;
      continue;
    }

    throw new Error('無法解析的 token');
  }

  while (stack.length) {
    const t = stack.pop()!;
    if (t.type === 'lparen' || t.type === 'rparen')
      throw new Error('括號不匹配');
    out.push(t);
  }

  return out;
}

// ============ RPN 求值 ============
function evalRPN(rpn: ParseToken[], angleMode: AngleMode, ans: number): number {
  const { OPS, FNS } = makeEnv(angleMode);
  const st: number[] = [];

  // 將 ident 當成函數名，直到遇到隱式 '(' ')' 的分隔；為簡化，我們在 tokenizer 階段已把函數名壓入 out，
  // 這裡遇到 ident 時，視為函數結束，彙整參數（由逗號與括號在 toRPN 時已排好）。

  for (let i = 0; i < rpn.length; i++) {
    const t = rpn[i];
    if (t.type === 'num') {
      st.push(Number(t.value));
      continue;
    }
    if (t.type === 'const') {
      st.push(Number(t.value));
      continue;
    }

    if (t.type === 'ident') {
      const name = String(t.value);
      if (name === 'ans') {
        st.push(ans);
        continue;
      }
      const fn = FNS[name];
      if (!fn) throw new Error(`未知函數: ${name}`);
      if (fn.arity === 'var') {
        // 變動參數：直到上一個 special marker？這裡簡化：假設前面剛好 push 了 2 個以上參數
        // 由於我們沒有在 RPN 放入參數個數，這裡採用：遇到 min/max 時，至少取 2 個，然後一直往前吸直到遇到 NaN 標記（不適合）。
        // 簡化：使用者輸入 min(a,b) / max(a,b)（兩參數），或你可引導使用 pow(a,b)。
        const b = st.pop();
        const a = st.pop();
        if (a === undefined || b === undefined)
          throw new Error(`${name} 需要至少兩個參數`);
        st.push(fn.fn(a, b));
      } else if (fn.arity === 0) {
        st.push(fn.fn());
      } else if (fn.arity === 1) {
        const a = st.pop();
        if (a === undefined) throw new Error(`${name}(x)`);
        st.push(fn.fn(a));
      } else if (fn.arity === 2) {
        const b = st.pop();
        const a = st.pop();
        if (a === undefined || b === undefined) throw new Error(`${name}(a,b)`);
        st.push(fn.fn(a, b));
      }
      continue;
    }

    if (t.type === 'unary') {
      const a = st.pop();
      if (a === undefined) throw new Error('一元運算錯誤');
      st.push(OPS['neg'].fn(a));
      continue;
    }
    if (t.type === 'postfix') {
      const a = st.pop();
      if (a === undefined) throw new Error('後置運算錯誤');
      st.push(OPS['!'].fn(a));
      continue;
    }

    if (t.type === 'op') {
      const op = String(t.value);
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) throw new Error('運算子缺參數');
      const def = OPS[op as keyof typeof OPS];
      if (!def) throw new Error(`未知運算子: ${op}`);
      st.push(def.fn(a, b));
      continue;
    }

    throw new Error('RPN 求值錯誤');
  }

  if (st.length !== 1) throw new Error('表達式錯誤');
  const out = st[0];
  if (!Number.isFinite(out)) throw new Error('結果不是有限數');
  return out;
}

// ============ 主元件 ============
export default function Calculator() {
  const { darkMode } = useDarkMode();
  // 若你沒有 DarkModeContext，就用媒體查詢當預設
  // const prefersDark =
  //   typeof window !== 'undefined' &&
  //   window.matchMedia &&
  //   window.matchMedia('(prefers-color-scheme: dark)').matches;
  // const [darkMode, setDarkMode] = useState<boolean>(prefersDark);

  const [expr, setExpr] = useState<string>('');
  const [angleMode, setAngleMode] = useState<AngleMode>(
    () => (localStorage.getItem('calc-angle') as AngleMode) || 'RAD'
  );
  const [ans, setAns] = useState<number>(() =>
    Number(localStorage.getItem('calc-ans') || '0')
  );
  const [memory, setMemory] = useState<number>(() =>
    Number(localStorage.getItem('calc-mem') || '0')
  );
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem('calc-hist');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string>('');

  const env = useMemo(() => makeEnv(angleMode), [angleMode]);

  useEffect(() => {
    localStorage.setItem('calc-angle', angleMode);
  }, [angleMode]);
  useEffect(() => {
    localStorage.setItem('calc-ans', String(ans));
  }, [ans]);
  useEffect(() => {
    try {
      localStorage.setItem('calc-hist', JSON.stringify(history));
    } catch {}
  }, [history]);
  useEffect(() => {
    localStorage.setItem('calc-mem', String(memory));
  }, [memory]);
  useEffect(() => {
    localStorage.setItem('calc-last', expr);
  }, [expr]);
  useEffect(() => {
    const last = localStorage.getItem('calc-last');
    if (last) setExpr(last);
  }, []);

  // 解析預覽
  const preview = useMemo(() => {
    if (!expr.trim()) return '';
    try {
      const tokens = tokenize(expr.replace(/π/g, 'pi'));
      const rpn = toRPN(tokens, env);
      const val = evalRPN(rpn, angleMode, ans);
      setError('');
      return formatResult(val);
    } catch (e: any) {
      setError(e.message || '解析失敗');
      return '';
    }
  }, [expr, env, angleMode, ans]);

  // UI 工具
  const btn = (children: React.ReactNode, onClick: () => void, extra = '') => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-base font-medium transition-colors border ${
        darkMode
          ? 'bg-slate-800 border-white/10 text-slate-100 hover:bg-slate-700'
          : 'bg-slate-100 border-black/10 text-slate-900 hover:bg-slate-200'
      } ${extra}`}
    >
      {children}
    </button>
  );
  const btnAccent = (
    children: React.ReactNode,
    onClick: () => void,
    extra = ''
  ) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-base font-semibold transition-colors ${
        darkMode
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${extra}`}
    >
      {children}
    </button>
  );
  const btnDanger = (
    children: React.ReactNode,
    onClick: () => void,
    extra = ''
  ) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-base font-medium transition-colors border ${
        darkMode
          ? 'bg-transparent border-rose-400/30 text-rose-200 hover:bg-rose-500/10'
          : 'bg-white border-rose-300 text-rose-600 hover:bg-rose-50'
      } ${extra}`}
    >
      {children}
    </button>
  );

  // 操作
  const insert = (s: string) => setExpr((prev) => prev + s);
  const backspace = () => setExpr((prev) => prev.slice(0, -1));
  const clearAll = () => {
    setExpr('');
    setError('');
  };
  const clearEntry = () => setExpr('');

  const evaluate = () => {
    try {
      const tokens = tokenize(expr.replace(/π/g, 'pi'));
      const rpn = toRPN(tokens, env);
      const val = evalRPN(rpn, angleMode, ans);
      if (!Number.isFinite(val)) throw new Error('結果不是有限數');
      setAns(val);
      setHistory((h) =>
        [{ id: uid(), expr, result: val, t: Date.now() }, ...h].slice(0, 200)
      );
      setExpr(String(val));
      setError('');
    } catch (e: any) {
      setError(e.message || '計算失敗');
    }
  };

  // 記憶體
  const memClear = () => setMemory(0);
  const memRecall = () => insert(formatResult(memory));
  const memPlus = () => setMemory((m) => m + Number(preview || 0));
  const memMinus = () => setMemory((m) => m - Number(preview || 0));
  const memStore = () => setMemory(Number(preview || 0));

  // 鍵盤支援
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return; // 放過複製貼上
      const key = e.key;
      if (/^[0-9.]$/.test(key)) {
        setExpr((p) => p + key);
        return;
      }
      if (['+', '-', '*', '/', '^', '%'].includes(key)) {
        setExpr((p) => p + key);
        return;
      }
      if (key === '(' || key === ')') {
        setExpr((p) => p + key);
        return;
      }
      if (key.toLowerCase() === 'p') {
        setExpr((p) => p + 'pi');
        return;
      }
      if (key === 'Enter') {
        e.preventDefault();
        evaluate();
        return;
      }
      if (key === 'Backspace') {
        backspace();
        return;
      }
      if (key === 'Delete') {
        clearEntry();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [evaluate]);

  return (
    <div
      className={`max-w-6xl mx-auto p-4 md:p-6 space-y-4 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xl font-extrabold">
          計算機
        </div>
        <div className="flex items-center gap-2">
          {btn(angleMode === 'RAD' ? 'RAD' : 'DEG', () =>
            setAngleMode((m) => (m === 'RAD' ? 'DEG' : 'RAD'))
          )}
          {btn('清空歷史', () => setHistory([]))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* 主面板 */}
        <section
          className={`rounded-xl border ${
            darkMode
              ? 'border-white/10 bg-slate-900'
              : 'border-black/10 bg-white'
          } p-3 md:p-4`}
        >
          {/* 顯示區 */}
          <div className="flex flex-col gap-1 mb-3">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>
                模式：{angleMode} {memory !== 0 ? '· M' : ''}
              </span>
              <span className="truncate">Ans = {formatResult(ans)}</span>
            </div>
            <input
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              className={`w-full rounded-lg border px-3 py-3 text-right text-2xl font-mono outline-none ${
                darkMode
                  ? 'bg-slate-950 border-white/10'
                  : 'bg-white border-black/10'
              }`}
              placeholder="輸入算式，例如: (2+3)*4 - sin(30)"
            />
            <div className="h-6 text-right font-mono text-lg">
              {error ? (
                <span className="text-rose-400">{error}</span>
              ) : (
                <span className="text-slate-300">{preview}</span>
              )}
            </div>
          </div>

          {/* 記憶體列 */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {btn('MC', memClear)}
            {btn('MR', memRecall)}
            {btn('M+', memPlus)}
            {btn('M-', memMinus)}
            {btn('MS', memStore)}
          </div>

          {/* 功能鍵列 */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-2">
            {btn('(', () => insert('('))}
            {btn(')', () => insert(')'))}
            {btn('π', () => insert('pi'))}
            {btn('e', () => insert('e'))}
            {btn('Ans', () => insert('ans'))}
            {btn('x²', () => insert('^2'))}
            {btn('x^y', () => insert('^'))}
            {btn('√', () => insert('sqrt('))}
            {btn('∛', () => insert('cbrt('))}
            {btn('!', () => insert('!'))}

            {btn('sin', () => insert('sin('))}
            {btn('cos', () => insert('cos('))}
            {btn('tan', () => insert('tan('))}
            {btn('asin', () => insert('asin('))}
            {btn('acos', () => insert('acos('))}
            {btn('atan', () => insert('atan('))}
            {btn('ln', () => insert('ln('))}
            {btn('log', () => insert('log('))}
            {btn('exp', () => insert('exp('))}
            {btn('10^x', () => insert('10^'))}
          </div>

          {/* 主按鍵盤 */}
          <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
            {btnDanger('AC', clearAll)}
            {btn('C', clearEntry)}
            {btn('⌫', backspace)}
            {btn('/', () => insert('/'))}

            {btn('7', () => insert('7'))}
            {btn('8', () => insert('8'))}
            {btn('9', () => insert('9'))}
            {btn('*', () => insert('*'))}

            {btn('4', () => insert('4'))}
            {btn('5', () => insert('5'))}
            {btn('6', () => insert('6'))}
            {btn('-', () => insert('-'))}

            {btn('1', () => insert('1'))}
            {btn('2', () => insert('2'))}
            {btn('3', () => insert('3'))}
            {btn('+', () => insert('+'))}

            {btn('%', () => insert('%'))}
            {btn('0', () => insert('0'))}
            {btn('.', () => insert('.'))}
            {btnAccent('＝', evaluate)}
          </div>
        </section>

        {/* 歷史 / 錄帶 */}
        <aside
          className={`rounded-xl border ${
            darkMode
              ? 'border-white/10 bg-slate-900'
              : 'border-black/10 bg-white'
          } p-3 md:p-4`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">計算歷史</h3>
            <div className="flex gap-2">
              {btn('複製結果', () => copyToClipboard(String(preview || ans)))}
              {btn('清除歷史', () => setHistory([]))}
            </div>
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-slate-400">
              尚無歷史。按 ＝ 後會出現在這裡。
            </div>
          ) : (
            <ul className="space-y-2 max-h-[420px] overflow-auto">
              {history.map((h) => (
                <li
                  key={h.id}
                  className={`p-2 rounded-lg border ${
                    darkMode
                      ? 'border-white/10 hover:bg-slate-800/80'
                      : 'border-black/10 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs text-slate-400">
                    {new Date(h.t).toLocaleString()}
                  </div>
                  <div className="font-mono text-sm break-all">{h.expr}</div>
                  <div className="font-mono text-lg">
                    = {formatResult(h.result)}
                  </div>
                  <div className="mt-1 flex gap-2">
                    {btn('帶回表達式', () => setExpr(h.expr))}
                    {btn('帶回答案', () => setExpr(String(h.result)))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

// ============ 小工具 ============
function copyToClipboard(text: string) {
  try {
    navigator.clipboard.writeText(text);
  } catch {}
}

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  // 避免長尾：用科學記號或限制小數位
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e8)) return n.toExponential(10);
  // 最多 12 位有效小數，去除尾端 0
  let s = n.toFixed(12);
  s = s.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
  return s;
}
