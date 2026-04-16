'use client';

import { useReducer, useRef, useState } from 'react';
import { MathText, TiptapDark, GraphDisplay } from './preview-tiptap';

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

export function QuizSetRenderer({ contentJson, initialShowSolutions = false }) {
  const blocks = toBlocks(contentJson);
  const quizBlocks = blocks.filter((b) => b.type === 'quiz');
  const [state, dispatch] = useReducer(quizReducer, quizBlocks, initQuizState);
  const [showSolutions, setShowSolutions] = useState(initialShowSolutions);

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
