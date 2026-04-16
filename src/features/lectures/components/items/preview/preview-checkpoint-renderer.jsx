'use client';

import { useState } from 'react';
import { MathText, TiptapDark } from './preview-tiptap';

function CheckpointBlockPreview({ block, index, showSolution }) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const normalise = (s) => (s ?? '').trim().toLowerCase();
  const canSubmit = input.trim() !== '';

  function handleSubmit() {
    if (submitted) return;
    setCorrect(normalise(input) === normalise(block.answer));
    setSubmitted(true);
  }

  return (
    <div>
      <div className='flex items-center gap-3 mb-3'>
        <span className='text-violet-400 text-sm font-black'>Checkpoint {index + 1}</span>
      </div>

      <p className='text-white font-bold text-base leading-relaxed mb-4'>
        <MathText text={block.question} />
      </p>

      <input
        type='text'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && canSubmit && !submitted && handleSubmit()}
        disabled={submitted || showSolution}
        placeholder='답을 입력하세요...'
        className='w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#5a5a72] focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-60 mb-4'
      />

      {/* Hint */}
      {block.hint && showHint && !showSolution && (
        <div className='mb-3 bg-[#1e1e32] border-l-2 border-amber-400/60 rounded-lg px-4 py-2.5 text-sm text-[#b0b0c8]'>
          💡 <MathText text={block.hint} />
        </div>
      )}

      {/* Solution (admin inspect mode) */}
      {showSolution && (
        <div className='mb-3 space-y-2'>
          {block.answer && (
            <div className='bg-[#1e1e32] border-l-2 border-emerald-400/60 rounded-lg px-4 py-2.5 text-sm'>
              <span className='text-emerald-400 font-bold text-xs uppercase tracking-widest block mb-1'>Answer</span>
              <span className='text-[#b0b0c8] font-mono'>{block.answer}</span>
            </div>
          )}
          {block.hint && (
            <div className='bg-[#1e1e32] border-l-2 border-amber-400/60 rounded-lg px-4 py-2.5 text-sm text-[#b0b0c8]'>
              💡 <MathText text={block.hint} />
            </div>
          )}
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
        {!submitted && !showSolution ? (
          <button
            type='button'
            disabled={!canSubmit}
            onClick={handleSubmit}
            className='px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors'
          >
            Check
          </button>
        ) : <span />}
        {block.hint && !submitted && !showHint && !showSolution && (
          <button
            type='button'
            onClick={() => setShowHint(true)}
            className='text-xs border border-[#3a3a4e] rounded-full px-3 py-1 text-[#9090a8] hover:text-amber-400 hover:border-amber-400/60 transition-colors'
          >
            힌트 보기
          </button>
        )}
      </div>
    </div>
  );
}

export function CheckpointRenderer({ contentJson, showSolutions = false }) {
  const blocks = Array.isArray(contentJson?.blocks) ? contentJson.blocks : [];
  if (blocks.length === 0) return <p className='text-sm text-[#5a5a72]'>No content</p>;

  let cpIndex = -1;
  return (
    <div className='space-y-6'>
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return <TiptapDark key={block.id ?? i} doc={block.content} />;
        }
        if (block.type === 'checkpoint') {
          cpIndex++;
          return (
            <CheckpointBlockPreview
              key={block.id ?? i}
              block={block}
              index={cpIndex}
              showSolution={showSolutions}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
