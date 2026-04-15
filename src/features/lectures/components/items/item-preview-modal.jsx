'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { X, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  { ssr: false, loading: () => <div className='h-full bg-[#1e1e1e] animate-pulse' /> },
);
import { generateHTML, Node } from '@tiptap/core';
import DOMPurify from 'dompurify';
import katex from 'katex';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';

// Lightweight stub nodes for generateHTML (no React view needed)
const MathBlockStub = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  addAttributes() { return { latex: { default: '' } }; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'math-preview' }, HTMLAttributes.latex || ''];
  },
});
const GraphBlockStub = Node.create({
  name: 'graphBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      expression: { default: '' },
      xMin: { default: -10 }, xMax: { default: 10 },
      yMin: { default: -10 }, yMax: { default: 10 },
      width: { default: 600 }, height: { default: 400 },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'graph-preview' }, `f(x) = ${HTMLAttributes.expression}`];
  },
});

// ─── Tiptap extensions ────────────────────────────────────────────────────────

const EXTENSIONS = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight.configure({ multicolor: true }),
  Subscript,
  Superscript,
  Image,
  TaskList,
  TaskItem.configure({ nested: true }),
  MathBlockStub,
  GraphBlockStub,
];

// ─── KaTeX ────────────────────────────────────────────────────────────────────

function decodeMathEntities(expr) {
  return expr
    .replace(/\t/g, '\\t').replace(/\x08/g, '\\b').replace(/\f/g, '\\f').replace(/\r/g, '\\r')
    .replace(/\n/g, ' ')
    .replace(/&amp;gt;/g, '>').replace(/&amp;lt;/g, '<').replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"');
}

function applyMathToHtml(html) {
  if (!html) return html;
  // Allow < > in math (comparisons like $x > 3$); skip matches containing HTML tags
  let result = html.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$$${expr}$$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: true, throwOnError: false }); }
    catch { return `$$${expr}$$`; }
  });
  result = result.replace(/\$([^$]+?)\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$${expr}$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: false, throwOnError: false }); }
    catch { return `$${expr}$`; }
  });
  return result;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMath(text) {
  if (!text) return '';
  // Escape HTML first so literal < > in math (e.g. $x > 3$) are safe
  let result = escapeHtml(text);
  // Backtick inline code → <code> tags (before math processing to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, (_, code) =>
    `<code style="padding:1px 6px;border-radius:4px;background:#2a2a44;color:#c4b5fd;font-size:0.8em;font-family:monospace">${code}</code>`
  );
  result = result.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$$${expr}$$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: true, throwOnError: false }); }
    catch { return expr; }
  });
  result = result.replace(/\$([^$]+?)\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$${expr}$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: false, throwOnError: false }); }
    catch { return expr; }
  });
  return result;
}

function MathText({ text, className = '' }) {
  if (!text) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: renderMath(text) }} />;
}

// ─── Tiptap dark renderer ─────────────────────────────────────────────────────

function TiptapDark({ doc }) {
  if (!doc?.content?.length) return null;
  try {
    const raw = generateHTML(doc, EXTENSIONS);
    const sanitized = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true }, ADD_ATTR: ['class'] });
    const safe = applyMathToHtml(sanitized);
    return (
      <div
        className='text-[#c9d1d9] text-sm leading-relaxed
          [&_p]:my-1.5
          [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
          [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5
          [&_h3]:text-white [&_h3]:font-semibold [&_h3]:mt-2
          [&_strong]:text-white [&_em]:italic
          [&_code]:bg-[#2a2a44] [&_code]:text-violet-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
          [&_pre]:bg-[#0d1117] [&_pre]:border [&_pre]:border-[#2a2a3e] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-0.5
          [&_li]:text-[#c9d1d9]
          [&_blockquote]:border-l-2 [&_blockquote]:border-[#4a4a5e] [&_blockquote]:pl-4 [&_blockquote]:text-[#9090a8] [&_blockquote]:my-2
          [&_a]:text-violet-400 [&_a]:underline
          [&_hr]:border-[#2a2a3e]
          [&_.math-preview]:bg-[#1a1a2e] [&_.math-preview]:border [&_.math-preview]:border-[#2a2a3e] [&_.math-preview]:rounded-lg [&_.math-preview]:p-4 [&_.math-preview]:my-3 [&_.math-preview]:font-mono [&_.math-preview]:text-violet-300
          [&_.graph-preview]:bg-[#1a1a2e] [&_.graph-preview]:border [&_.graph-preview]:border-[#2a2a3e] [&_.graph-preview]:rounded-lg [&_.graph-preview]:p-4 [&_.graph-preview]:my-3 [&_.graph-preview]:font-mono [&_.graph-preview]:text-teal-300'
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  } catch (err) {
    console.error('TiptapDark render error:', err);
    return <p className='text-sm text-[#5a5a72] italic'>Unable to render content</p>;
  }
}

// ─── Graph ────────────────────────────────────────────────────────────────────

function GraphDisplay({ fn1, fn2, label1, label2, xDomain, yDomain }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !fn1) return;
    let cancelled = false;
    import('function-plot').then(({ default: functionPlot }) => {
      if (cancelled || !containerRef.current) return;
      const width = containerRef.current.offsetWidth || 420;
      const height = Math.round(width * 0.6);
      const data = [{ fn: fn1, color: '#2dd4bf', graphType: 'polyline' }];
      if (fn2) data.push({ fn: fn2, color: '#818cf8', graphType: 'polyline' });
      try {
        containerRef.current.innerHTML = '';
        functionPlot({
          target: containerRef.current,
          width, height,
          xAxis: { domain: xDomain ?? [-10, 10], label: 'x' },
          yAxis: { domain: yDomain ?? [-10, 10], label: 'y' },
          grid: true, data,
        });
      } catch (e) { console.error(e); }
    });
    return () => { cancelled = true; };
  }, [fn1, fn2, xDomain, yDomain]);

  if (!fn1) return null;
  return (
    <div className='my-4 rounded-xl overflow-hidden border border-[#2a2a3e] bg-[#0d1117]'>
      <div className='px-3 pt-2 flex gap-4 text-xs font-mono'>
        {label1 && <span className='text-teal-400'>— {label1}</span>}
        {label2 && fn2 && <span className='text-violet-400'>— {label2}</span>}
      </div>
      <div ref={containerRef} className='w-full [&_svg]:w-full' />
    </div>
  );
}

// ─── Math keyboard ────────────────────────────────────────────────────────────

const KB_ROWS = [
  [{ label: 'x²', insert: '²' }, { label: 'xⁿ', insert: '^' }, { label: '√', insert: '√' }, { label: '+', insert: '+' }, { label: '−', insert: '−' }],
  [{ label: '½', insert: '/' }, { label: '·', insert: '·' }, { label: '(', insert: '(' }, { label: ')', insert: ')' }, { label: '⌫', action: 'backspace' }],
  [{ label: 'π', insert: 'π' }, { label: '∞', insert: '∞' }, { label: '≠', insert: '≠' }, { label: '≤', insert: '≤' }, { label: '≥', insert: '≥' }],
];

function MathKeyboard({ inputRef, value, onChange }) {
  function insert(symbol) {
    const el = inputRef?.current;
    if (!el) { onChange(value + symbol); return; }
    const s = el.selectionStart ?? value.length, e2 = el.selectionEnd ?? value.length;
    const next = value.slice(0, s) + symbol + value.slice(e2);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + symbol.length, s + symbol.length); });
  }
  function backspace() {
    const el = inputRef?.current;
    if (!el) { onChange(value.slice(0, -1)); return; }
    const s = el.selectionStart ?? value.length, e2 = el.selectionEnd ?? value.length;
    const next = s !== e2 ? value.slice(0, s) + value.slice(e2) : s > 0 ? value.slice(0, s - 1) + value.slice(s) : value;
    onChange(next);
    requestAnimationFrame(() => { el.focus(); const pos = Math.max(0, s === e2 ? s - 1 : s); el.setSelectionRange(pos, pos); });
  }
  return (
    <div className='mt-1 p-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg shadow-lg w-fit'>
      {KB_ROWS.map((row, ri) => (
        <div key={ri} className='flex gap-1 mb-1 last:mb-0'>
          {row.map((key) => (
            <button key={key.label} type='button'
              onMouseDown={(e) => { e.preventDefault(); key.action === 'backspace' ? backspace() : insert(key.insert); }}
              className='w-10 h-9 flex items-center justify-center rounded bg-[#2a2a3e] hover:bg-[#3a3a5e] text-white text-sm font-mono font-bold transition-colors select-none'
            >{key.label}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Quiz block (interactive) ─────────────────────────────────────────────────

const LETTERS = ['①', '②', '③', '④', '⑤', '⑥'];

function normaliseMath(str) {
  return str.replace(/\u2212/g, '-').replace(/\u00b2/g, '^2').replace(/\s+/g, '').toLowerCase();
}

function initQuizState(quizBlocks) {
  return quizBlocks.reduce((acc, q) => {
    acc[q.id] = { selected: null, input: '', submitted: false, correct: false, hintIndex: 0, showExpl: false, showKb: false };
    return acc;
  }, {});
}

function quizReducer(state, action) {
  const q = state[action.id] ?? {};
  switch (action.type) {
    case 'SELECT':    return { ...state, [action.id]: { ...q, selected: action.value } };
    case 'INPUT':     return { ...state, [action.id]: { ...q, input: action.value } };
    case 'SUBMIT':    return { ...state, [action.id]: { ...q, submitted: true, correct: action.correct } };
    case 'RETRY':     return { ...state, [action.id]: { ...q, selected: null, input: '', submitted: false, correct: false } };
    case 'HINT':      return { ...state, [action.id]: { ...q, hintIndex: Math.min((q.hintIndex ?? 0) + 1, action.total) } };
    case 'EXPL':      return { ...state, [action.id]: { ...q, showExpl: true } };
    case 'TOGGLE_KB': return { ...state, [action.id]: { ...q, showKb: !q.showKb } };
    default: return state;
  }
}

function QuizBlockPreview({ block, quizIndex, qState, dispatch, showSolution }) {
  const { selected, input, submitted, correct, hintIndex, showExpl, showKb } = qState;
  const hints = block.hints ?? [];
  const isMC   = block.quizType === 'MULTIPLE_CHOICE';
  const isMath = block.quizType === 'MATH_INPUT';
  const canSubmit = isMC ? selected !== null : input.trim() !== '';
  const mathRef = useRef(null);

  function handleSubmit() {
    if (submitted) return;
    let isCorrect = false;
    if (isMC) {
      isCorrect = (block.options ?? []).find((o) => o.id === selected)?.isCorrect === true;
    } else if (isMath) {
      isCorrect = normaliseMath(input.trim()) === normaliseMath((block.correctAnswer ?? '').trim());
    } else {
      isCorrect = input.trim().toLowerCase() === (block.correctAnswer ?? '').trim().toLowerCase();
    }
    dispatch({ type: 'SUBMIT', id: block.id, correct: isCorrect });
  }

  return (
    <div>
      <div className='flex items-center gap-3 mb-3'>
        <span className='text-violet-400 text-sm font-black'>Problem {quizIndex + 1}</span>
        {(block.points ?? 0) > 0 && <span className='bg-violet-500/20 text-violet-300 text-[11px] font-bold px-2 py-0.5 rounded-full'>{block.points} XP</span>}
      </div>

      <p className='text-white font-bold text-base leading-relaxed mb-4'><MathText text={block.question} /></p>

      {block.graph?.fn1 && (
        <GraphDisplay fn1={block.graph.fn1} fn2={block.graph.fn2} label1={block.graph.label1} label2={block.graph.label2} xDomain={block.graph.xDomain} yDomain={block.graph.yDomain} />
      )}

      {/* Multiple Choice */}
      {isMC && (
        <div className='space-y-2 mb-5'>
          {(block.options ?? []).map((opt, i) => {
            const isSel = selected === opt.id;
            let cls = 'border-[#2a2a3e] text-[#c9d1d9] hover:border-[#4a4a5e]';
            if (submitted || showSolution) {
              if (opt.isCorrect) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
              else if (isSel && !opt.isCorrect) cls = 'border-rose-500 bg-rose-500/10 text-rose-300';
              else cls = 'border-[#2a2a3e] text-[#5a5a72]';
            } else if (isSel) cls = 'border-violet-500 bg-violet-500/10 text-white';
            return (
              <button key={opt.id} type='button' disabled={submitted || showSolution}
                onClick={() => dispatch({ type: 'SELECT', id: block.id, value: opt.id })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors text-left text-sm ${cls} ${(submitted || showSolution) ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className='shrink-0 text-base'>{LETTERS[i] ?? i + 1}</span>
                <MathText text={opt.text} />
              </button>
            );
          })}
        </div>
      )}

      {/* Short Answer */}
      {!isMC && !isMath && (
        <input type='text' value={input}
          onChange={(e) => dispatch({ type: 'INPUT', id: block.id, value: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && canSubmit && !submitted && handleSubmit()}
          disabled={submitted || showSolution} placeholder='답을 입력하세요...'
          className='w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#5a5a72] focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-60 mb-5'
        />
      )}

      {/* Math Input */}
      {isMath && (
        <div className='mb-5'>
          <div className='flex items-center gap-2'>
            <input ref={mathRef} type='text' value={input}
              onChange={(e) => dispatch({ type: 'INPUT', id: block.id, value: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && canSubmit && !submitted && handleSubmit()}
              disabled={submitted || showSolution} placeholder='답을 입력하세요...'
              className='flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-[#5a5a72] focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-60'
            />
            {!submitted && !showSolution && (
              <button type='button' onClick={() => dispatch({ type: 'TOGGLE_KB', id: block.id })}
                className='w-9 h-9 flex items-center justify-center rounded-lg bg-[#2a2a3e] hover:bg-[#3a3a5e] text-[#9090a8] hover:text-violet-400 transition-colors text-base'
              >⌨</button>
            )}
          </div>
          {showKb && !submitted && !showSolution && (
            <MathKeyboard inputRef={mathRef} value={input} onChange={(val) => dispatch({ type: 'INPUT', id: block.id, value: val })} />
          )}
          {input && (
            <div className='mt-1.5 px-3 py-1.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-sm text-white min-h-8 flex items-center'>
              <MathText text={input} />
            </div>
          )}
        </div>
      )}

      {/* Hints */}
      {hints.slice(0, hintIndex).map((hint, i) => (
        <div key={i} className='mb-2 bg-[#1e1e32] border-l-2 border-amber-400/60 rounded-lg px-4 py-2.5 text-sm text-[#b0b0c8]'>
          💡 <MathText text={hint} />
        </div>
      ))}

      {/* Solution */}
      {showSolution && block.explanation && (
        <div className='mb-4 bg-[#1e1e32] border-l-2 border-violet-400/60 rounded-lg px-4 py-3 text-sm text-[#b0b0c8]'>
          <span className='text-violet-400 font-bold text-xs uppercase tracking-widest block mb-1'>Solution</span>
          <MathText text={block.explanation} />
        </div>
      )}

      {/* Post-submit explanation */}
      {submitted && showExpl && block.explanation && (
        <div className='mb-4 bg-[#1e1e32] border-l-2 border-violet-400/60 rounded-lg px-4 py-3 text-sm text-[#b0b0c8]'>
          <MathText text={block.explanation} />
        </div>
      )}

      {/* Result */}
      {submitted && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 border-l-2 text-sm font-semibold ${correct ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
          {correct ? '✓ 정답입니다!' : '✗ 오답입니다.'}
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div className='flex gap-2'>
          {!submitted && !showSolution ? (
            <button type='button' disabled={!canSubmit} onClick={handleSubmit}
              className='px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors'
            >Check</button>
          ) : submitted && !correct ? (
            <button type='button' onClick={() => dispatch({ type: 'RETRY', id: block.id })}
              className='px-5 py-2 rounded-lg bg-[#2a2a3e] hover:bg-[#3a3a4e] text-[#c9d1d9] text-sm font-bold transition-colors'
            >다시 풀기</button>
          ) : null}
        </div>
        <div className='flex items-center gap-3'>
          {hints.length > 0 && hintIndex < hints.length && !submitted && (
            <button type='button' onClick={() => dispatch({ type: 'HINT', id: block.id, total: hints.length })}
              className='flex items-center gap-1.5 text-xs text-[#9090a8] hover:text-amber-400 transition-colors'
            >
              <span className='text-[#5a5a72]'>{hintIndex}/{hints.length}</span>
              <span className='border border-[#3a3a4e] rounded-full px-2.5 py-1 hover:border-amber-400/60'>힌트 보기</span>
            </button>
          )}
          {submitted && block.explanation && !showExpl && (
            <button type='button' onClick={() => dispatch({ type: 'EXPL', id: block.id })}
              className='text-xs border border-[#3a3a4e] rounded-full px-3 py-1 text-[#9090a8] hover:text-violet-400 hover:border-violet-400/60 transition-colors'
            >해설 보기</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Blocks renderer ──────────────────────────────────────────────────────────

function toBlocks(contentJson) {
  if (!contentJson) return [];
  if (Array.isArray(contentJson.blocks)) return contentJson.blocks;
  if (Array.isArray(contentJson.quizzes)) {
    const blocks = [];
    if (contentJson.introduction) blocks.push({ id: 'intro', type: 'text', content: contentJson.introduction });
    for (const q of contentJson.quizzes) blocks.push({ ...q, id: q.id ?? String(Math.random()), type: 'quiz' });
    return blocks;
  }
  if (contentJson.question !== undefined) return [{ id: 'q0', type: 'quiz', ...contentJson }];
  return [];
}

function QuizSetRenderer({ contentJson }) {
  const blocks = toBlocks(contentJson);
  const quizBlocks = blocks.filter((b) => b.type === 'quiz');
  const [state, dispatch] = useReducer(quizReducer, quizBlocks, initQuizState);
  const [showSolutions, setShowSolutions] = useState(false);

  if (blocks.length === 0) return <p className='text-sm text-[#5a5a72]'>No content</p>;

  let quizCounter = -1;
  return (
    <div className='space-y-6'>
      {blocks.map((block) => {
        if (block.type === 'text') return <TiptapDark key={block.id} doc={block.content} />;
        quizCounter++;
        return (
          <QuizBlockPreview key={block.id} block={block} quizIndex={quizCounter}
            qState={state[block.id] ?? { selected: null, input: '', submitted: false, correct: false, hintIndex: 0, showExpl: false, showKb: false }}
            dispatch={dispatch} showSolution={showSolutions}
          />
        );
      })}

      {quizBlocks.length > 0 && (
        <div className='pt-2 border-t border-[#2a2a3e]'>
          <button type='button' onClick={() => setShowSolutions((v) => !v)}
            className='text-sm text-[#4a8fff] hover:text-[#6aafff] transition-colors flex items-center gap-1'
          >
            I need help. Please show me the solution.
            <span className='text-xs ml-1'>{showSolutions ? '∧' : '∨'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CODING_SET renderer ──────────────────────────────────────────────────────

function getMonacoLanguage(language) {
  const map = { javascript: 'javascript', java: 'java', cpp: 'cpp', c: 'c', python: 'python' };
  return map[language] ?? 'plaintext';
}

function SingleCodingProblem({ problem }) {
  const [activeFile, setActiveFile] = useState(0);
  const files = Array.isArray(problem.files) && problem.files.length > 0
    ? problem.files
    : problem.fileName ? [{ name: problem.fileName, content: problem.starterCode ?? '' }] : [];
  const currentFile = files[activeFile] ?? files[0];
  const lineCount = (currentFile?.content ?? '').split('\n').length;
  const editorHeight = Math.max(120, Math.min(lineCount * 19 + 24, 400));

  return (
    <div className='space-y-4'>
      {problem.description && <TiptapDark doc={problem.description} />}

      {problem.language && (
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72]'>Language</span>
          <span className='text-xs font-mono bg-[#1a1a2e] border border-[#2a2a3e] text-[#9090a8] px-2 py-0.5 rounded'>{problem.language}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className='rounded-lg overflow-hidden border border-[#2a2a3e]'>
          {/* File tabs */}
          <div className='flex items-center bg-[#0e0e1a] border-b border-[#2a2a3e] overflow-x-auto'>
            {files.map((f, idx) => (
              <button key={f.id ?? idx} type='button' onClick={() => setActiveFile(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs border-r border-[#2a2a3e] shrink-0 transition-colors ${
                  idx === activeFile ? 'bg-[#1e1e1e] text-white' : 'text-[#5a5a72] hover:text-[#9090a8] hover:bg-[#141424]'
                }`}
              >
                <span>{f.name || 'untitled'}</span>
              </button>
            ))}
          </div>
          {/* Monaco read-only editor */}
          <div style={{ height: editorHeight }}>
            <MonacoEditor
              key={`${activeFile}-${currentFile?.name}`}
              height={editorHeight}
              language={getMonacoLanguage(problem.language)}
              theme='vs-dark'
              value={currentFile?.content ?? ''}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: 'on',
                folding: false,
                contextmenu: false,
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                overviewRulerLanes: 0,
              }}
            />
          </div>
        </div>
      )}

      {Array.isArray(problem.testCases) && problem.testCases.length > 0 && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>
            Test Cases ({problem.testCases.length})
            {problem.functionName && (
              <span className='ml-2 text-violet-400 normal-case tracking-normal font-mono'>fn: {problem.functionName}()</span>
            )}
            {problem.evaluationStyle && (
              <span className='ml-2 text-[10px] bg-[#1a1a2e] border border-[#2a2a3e] px-1.5 py-0.5 rounded normal-case tracking-normal text-[#9090a8]'>
                {problem.evaluationStyle}
              </span>
            )}
          </p>
          <div className='space-y-2'>
            {problem.testCases.map((tc, ti) => {
              const isFn = Array.isArray(tc.args);
              return (
                <div key={ti} className='rounded-lg border border-[#2a2a3e] bg-[#0d1117] p-3 space-y-1'>
                  <span className='text-xs font-bold text-[#5a5a72]'>Test {ti + 1}</span>
                  <div className='grid grid-cols-2 gap-3 text-xs font-mono'>
                    <div>
                      <span className='text-[#5a5a72] font-sans font-bold'>{isFn ? 'Args' : 'Input'}</span>
                      <pre className='mt-1 bg-[#1a1a2e] rounded px-2 py-1.5 text-[#c9d1d9] whitespace-pre-wrap min-h-[28px]'>
                        {isFn ? JSON.stringify(tc.args) : (tc.input || '(no stdin)')}
                      </pre>
                    </div>
                    <div>
                      <span className='text-[#5a5a72] font-sans font-bold'>{isFn ? 'Expected Return' : 'Expected Output'}</span>
                      <pre className='mt-1 bg-[#1a1a2e] rounded px-2 py-1.5 text-[#c9d1d9] whitespace-pre-wrap min-h-[28px]'>
                        {isFn ? JSON.stringify(tc.expected) : tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {problem.expectedOutput && !problem.testCases?.length && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>Expected Output</p>
          <pre className='bg-[#0d1117] border border-[#2a2a3e] rounded-lg p-4 text-sm font-mono text-[#c9d1d9] whitespace-pre-wrap'>{problem.expectedOutput}</pre>
        </div>
      )}

      {(problem.hints ?? []).length > 0 && (
        <div className='space-y-2'>
          {problem.hints.map((h, i) => (
            <div key={i} className='bg-[#1e1e32] border-l-2 border-amber-400/60 rounded-lg px-4 py-2.5 text-sm text-[#b0b0c8]'>💡 <MathText text={h} /></div>
          ))}
        </div>
      )}
    </div>
  );
}

function CodingSetRenderer({ contentJson }) {
  const parsed = contentJson ?? {};
  const [problemIndex, setProblemIndex] = useState(0);

  // Normalise to problems[]
  const problems = Array.isArray(parsed.problems) && parsed.problems.length > 0
    ? parsed.problems
    : [parsed];

  const totalProblems = problems.length;
  const currentProblem = problems[problemIndex] ?? problems[0];

  return (
    <div className='space-y-5'>
      {/* Problem navigation */}
      {totalProblems > 1 && (
        <div className='flex items-center gap-3'>
          <button type='button' onClick={() => setProblemIndex((i) => Math.max(0, i - 1))}
            disabled={problemIndex === 0}
            className='p-1.5 rounded-md bg-[#1e1e32] text-[#9090a8] hover:text-white disabled:opacity-30 transition-colors'
          >‹</button>
          <span className='text-sm text-[#9090a8]'>
            Problem <span className='text-white font-semibold'>{problemIndex + 1}</span> / {totalProblems}
            {currentProblem?.title && <span className='ml-2 text-[#5a5a72]'>— {currentProblem.title}</span>}
          </span>
          <button type='button' onClick={() => setProblemIndex((i) => Math.min(totalProblems - 1, i + 1))}
            disabled={problemIndex === totalProblems - 1}
            className='p-1.5 rounded-md bg-[#1e1e32] text-[#9090a8] hover:text-white disabled:opacity-30 transition-colors'
          >›</button>
        </div>
      )}

      <SingleCodingProblem key={problemIndex} problem={currentProblem} />
    </div>
  );
}

// ─── Generic content renderer ─────────────────────────────────────────────────

function ContentRenderer({ item }) {
  if (!item) return <p className='text-sm text-[#5a5a72]'>No content</p>;

  const raw = item.contentJson ?? item.content;
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { parsed = null; }
  }

  if (item.itemType === 'QUIZ_SET' || item.itemType === 'TEST_BLOCK') return <QuizSetRenderer contentJson={parsed} />;
  if (item.itemType === 'CODING_SET') return <CodingSetRenderer contentJson={parsed} />;

  // Default: Tiptap doc
  return <TiptapDark doc={parsed} />;
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

export function ItemPreviewModal({ item, isLoading }) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        disabled={isLoading}
        className='inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <Eye size={14} />
        Preview
      </button>

      {open && (
        <div className='fixed inset-0 z-50 flex flex-col' style={{ background: '#0d0d1a' }}>
          {/* Top bar */}
          <div className='shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#2a2a3e] bg-[#0d0d1a]'>
            <div className='flex items-center gap-3'>
              <Eye size={15} className='text-violet-400' />
              <span className='text-sm font-bold text-white'>{item?.title ?? 'Preview'}</span>
              {item?.itemType && (
                <span className='text-[11px] font-mono bg-[#1a1a2e] border border-[#2a2a3e] text-[#9090a8] px-2 py-0.5 rounded'>
                  {item.itemType}
                </span>
              )}
              <span className='text-xs text-[#5a5a72] border border-[#2a2a3e] rounded px-2 py-0.5'>
                User View
              </span>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='w-8 h-8 flex items-center justify-center rounded-lg text-[#5a5a72] hover:text-white hover:bg-[#2a2a3e] transition-colors'
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className='flex-1 overflow-y-auto'>
            <div className='max-w-2xl mx-auto px-8 py-10'>
              {/* XP badge */}
              {(item?.points ?? 0) > 0 && (
                <div className='inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/30 rounded-full px-3 py-1 mb-4'>
                  <span className='text-violet-400 text-xs font-bold'>+{item.points} XP</span>
                </div>
              )}

              {/* Title */}
              <h1 className='text-2xl font-bold text-white mb-6'>{item?.title ?? 'Untitled'}</h1>

              {/* Content */}
              {isLoading ? (
                <p className='text-[#5a5a72] text-sm'>Loading...</p>
              ) : (
                <ContentRenderer item={item} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
