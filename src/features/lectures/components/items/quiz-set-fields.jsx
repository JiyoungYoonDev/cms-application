'use client';

import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import {
  CheckSquare, Trash2, AlignLeft, ChevronUp, ChevronDown,
} from 'lucide-react';
import { QuizBlock } from './quiz-set-block-editor';

// ─── Factories ─────────────────────────────────────────────────────────────────

function makeTextBlock() {
  return { id: crypto.randomUUID(), type: 'text', content: { type: 'doc', content: [] } };
}

function makeQuizBlock() {
  return {
    id: crypto.randomUUID(),
    type: 'quiz',
    quizType: 'MULTIPLE_CHOICE',
    question: '',
    options: [
      { id: 'a', text: '', isCorrect: false },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false },
    ],
    correctAnswer: '',
    explanation: '',
    hints: [],
    points: 30,
    graph: null,
  };
}

// ─── Migration: old format → blocks ────────────────────────────────────────────

export function parseQuizContent(raw) {
  if (!raw) return { blocks: [makeQuizBlock()] };

  // Already new blocks format
  if (Array.isArray(raw.blocks)) {
    return { blocks: raw.blocks.length > 0 ? raw.blocks : [makeQuizBlock()] };
  }

  // Old format: { introduction?, quizzes[] }
  if (Array.isArray(raw.quizzes)) {
    const blocks = [];
    if (raw.introduction && raw.introduction.content?.length > 0) {
      blocks.push({ id: crypto.randomUUID(), type: 'text', content: raw.introduction });
    }
    for (const quiz of raw.quizzes) {
      blocks.push({ ...quiz, id: quiz.id ?? crypto.randomUUID(), type: 'quiz' });
    }
    return { blocks: blocks.length > 0 ? blocks : [makeQuizBlock()] };
  }

  // Old single-quiz format
  if (raw.question !== undefined || raw.quizType !== undefined) {
    return {
      blocks: [{
        id: crypto.randomUUID(),
        type: 'quiz',
        quizType: raw.quizType ?? 'MULTIPLE_CHOICE',
        question: raw.question ?? '',
        options: raw.options ?? [],
        correctAnswer: raw.correctAnswer ?? '',
        explanation: raw.explanation ?? '',
        hints: raw.hints ?? [],
        points: raw.points ?? 30,
        graph: null,
      }],
    };
  }

  return { blocks: [makeQuizBlock()] };
}

// ─── Text Block ────────────────────────────────────────────────────────────────

function TextBlock({ block, onChange }) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1.5'>
        <AlignLeft size={11} className='text-muted-foreground' />
        <span className='text-[10px] font-black uppercase tracking-widest opacity-40'>Text / Explanation</span>
      </div>
      <SimpleEditor
        content={block.content ?? { type: 'doc', content: [] }}
        onChange={(doc) => onChange({ ...block, content: doc })}
      />
    </div>
  );
}

// ─── Insert bar between blocks ─────────────────────────────────────────────────

function InsertBar({ onInsertText, onInsertQuiz }) {
  return (
    <div className='flex items-center gap-2 justify-center py-0.5 group'>
      <div className='flex-1 h-px bg-border/40 group-hover:bg-border transition-colors' />
      <button
        type='button'
        onClick={onInsertText}
        className='flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-input/60 hover:border-input rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap'
      >
        <AlignLeft size={11} /> Text
      </button>
      <button
        type='button'
        onClick={onInsertQuiz}
        className='flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-input/60 hover:border-input rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap'
      >
        <CheckSquare size={11} /> Problem
      </button>
      <div className='flex-1 h-px bg-border/40 group-hover:bg-border transition-colors' />
    </div>
  );
}

// ─── Block wrapper (header + move/delete) ──────────────────────────────────────

function BlockWrapper({ block, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const isText = block.type === 'text';

  return (
    <div className={`rounded-xl border bg-card/30 p-5 space-y-4 ${isText ? 'border-blue-500/20' : 'border-violet-500/20'}`}>
      {/* Block header */}
      <div className='flex items-center justify-between'>
        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isText ? 'text-blue-400/60' : 'text-violet-400/60'}`}>
          {isText ? <AlignLeft size={10} /> : <CheckSquare size={10} />}
          {isText ? 'Text Block' : `Problem`}
        </span>
        <div className='flex items-center gap-1'>
          <button type='button' onClick={onMoveUp} disabled={index === 0} className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors'>
            <ChevronUp size={14} />
          </button>
          <button type='button' onClick={onMoveDown} disabled={index === total - 1} className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors'>
            <ChevronDown size={14} />
          </button>
          <button type='button' onClick={onRemove} disabled={total === 1} className='p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors'>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isText
        ? <TextBlock block={block} onChange={onUpdate} />
        : <QuizBlock block={block} onChange={onUpdate} />
      }
    </div>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────────

export function QuizSetFields({ value, onChange }) {
  const { blocks } = parseQuizContent(value);

  function updateBlock(index, updated) {
    const next = [...blocks];
    next[index] = updated;
    onChange({ blocks: next });
  }

  function removeBlock(index) {
    if (blocks.length === 1) return;
    onChange({ blocks: blocks.filter((_, i) => i !== index) });
  }

  function insertAt(index, block) {
    const next = [...blocks];
    next.splice(index, 0, block);
    onChange({ blocks: next });
  }

  function moveBlock(index, direction) {
    const next = [...blocks];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ blocks: next });
  }

  return (
    <div className='space-y-0'>
      {/* Top insert bar */}
      <InsertBar
        onInsertText={() => insertAt(0, makeTextBlock())}
        onInsertQuiz={() => insertAt(0, makeQuizBlock())}
      />

      {blocks.map((block, index) => (
        <div key={block.id}>
          <BlockWrapper
            block={block}
            index={index}
            total={blocks.length}
            onUpdate={(updated) => updateBlock(index, updated)}
            onRemove={() => removeBlock(index)}
            onMoveUp={() => moveBlock(index, -1)}
            onMoveDown={() => moveBlock(index, 1)}
          />
          <InsertBar
            onInsertText={() => insertAt(index + 1, makeTextBlock())}
            onInsertQuiz={() => insertAt(index + 1, makeQuizBlock())}
          />
        </div>
      ))}
    </div>
  );
}
