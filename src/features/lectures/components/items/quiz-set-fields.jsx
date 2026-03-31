'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import {
  CheckSquare, HelpCircle, Lightbulb, Plus, Trash2, Type, X,
  BarChart2, AlignLeft, ChevronUp, ChevronDown, GripVertical,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

const QUIZ_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER',    label: 'Short Answer' },
  { value: 'MATH_INPUT',      label: 'Math Input (with keyboard)' },
];

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

// ─── Graph config ──────────────────────────────────────────────────────────────

function GraphConfigFields({ graph, onChange }) {
  const [open, setOpen] = useState(!!graph);
  const g = graph ?? { fn1: '', fn2: '', label1: 'y = f(x)', label2: 'y = g(x)', xDomain: [-10, 10], yDomain: [-10, 10] };

  if (!open) {
    return (
      <button
        type='button'
        onClick={() => { setOpen(true); onChange(g); }}
        className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-input/60 rounded-lg px-3 py-2 transition-colors'
      >
        <BarChart2 size={12} /> Add Graph
      </button>
    );
  }

  const upd = (key, val) => onChange({ ...g, [key]: val });

  return (
    <div className='rounded-xl border border-input/60 bg-muted/20 p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <span className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <BarChart2 size={10} /> Graph
        </span>
        <button type='button' onClick={() => { setOpen(false); onChange(null); }} className='text-muted-foreground hover:text-destructive transition-colors'>
          <X size={13} />
        </button>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <label className='text-[10px] font-semibold opacity-50'>Function 1 (required)</label>
          <Input placeholder='e.g. 3*x - 5' value={g.fn1} onChange={(e) => upd('fn1', e.target.value)} className='h-8 text-xs font-mono border-input/60' />
        </div>
        <div className='space-y-1'>
          <label className='text-[10px] font-semibold opacity-50'>Label 1</label>
          <Input placeholder='y = f(x)' value={g.label1} onChange={(e) => upd('label1', e.target.value)} className='h-8 text-xs border-input/60' />
        </div>
        <div className='space-y-1'>
          <label className='text-[10px] font-semibold opacity-50'>Function 2 (optional)</label>
          <Input placeholder='e.g. 3 - 2*x' value={g.fn2} onChange={(e) => upd('fn2', e.target.value)} className='h-8 text-xs font-mono border-input/60' />
        </div>
        <div className='space-y-1'>
          <label className='text-[10px] font-semibold opacity-50'>Label 2</label>
          <Input placeholder='y = g(x)' value={g.label2} onChange={(e) => upd('label2', e.target.value)} className='h-8 text-xs border-input/60' />
        </div>
      </div>

      <div className='grid grid-cols-4 gap-2'>
        {[['X min', 0, 1], ['X max', 1, 1], ['Y min', 0, 0], ['Y max', 1, 0]].map(([lbl, idx, axis]) => (
          <div key={lbl} className='space-y-1'>
            <label className='text-[10px] font-semibold opacity-50'>{lbl}</label>
            <Input
              type='number'
              value={axis === 1 ? g.xDomain?.[idx] ?? (idx === 0 ? -10 : 10) : g.yDomain?.[idx] ?? (idx === 0 ? -10 : 10)}
              onChange={(e) => {
                if (axis === 1) {
                  const d = [...(g.xDomain ?? [-10, 10])]; d[idx] = Number(e.target.value); upd('xDomain', d);
                } else {
                  const d = [...(g.yDomain ?? [-10, 10])]; d[idx] = Number(e.target.value); upd('yDomain', d);
                }
              }}
              className='h-8 text-xs font-mono border-input/60'
            />
          </div>
        ))}
      </div>
      <p className='text-[10px] text-muted-foreground opacity-60'>JS math syntax: <code className='font-mono'>3*x - 5</code>, <code className='font-mono'>sin(x)</code>, <code className='font-mono'>x^2</code></p>
    </div>
  );
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

// ─── Quiz Block ────────────────────────────────────────────────────────────────

function QuizBlock({ block, onChange }) {
  const upd = (field, val) => onChange({ ...block, [field]: val });

  const handleOptionText    = (id, text) => upd('options', block.options.map((o) => (o.id === id ? { ...o, text } : o)));
  const handleOptionCorrect = (id) => upd('options', block.options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));
  const handleAddOption = () => {
    const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const nextId = LETTERS[block.options.length] ?? String(block.options.length);
    upd('options', [...block.options, { id: nextId, text: '', isCorrect: false }]);
  };
  const handleRemoveOption = (id) => { if (block.options.length > 2) upd('options', block.options.filter((o) => o.id !== id)); };
  const handleAddHint    = () => upd('hints', [...(block.hints ?? []), '']);
  const handleHintChange = (i, val) => { const n = [...(block.hints ?? [])]; n[i] = val; upd('hints', n); };
  const handleRemoveHint = (i) => upd('hints', (block.hints ?? []).filter((_, idx) => idx !== i));

  const isMC    = block.quizType === 'MULTIPLE_CHOICE';
  const isShort = block.quizType === 'SHORT_ANSWER';
  const isMath  = block.quizType === 'MATH_INPUT';

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className='space-y-4'>
      {/* Points + Type */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Points</label>
          <Input type='number' value={block.points ?? 30} onChange={(e) => upd('points', Number(e.target.value))} className='h-9 border-input/60 font-mono' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <CheckSquare size={10} /> Type
          </label>
          <Select value={block.quizType} onValueChange={(val) => upd('quizType', val)}>
            <SelectTrigger className='h-9 border-input/60'><SelectValue /></SelectTrigger>
            <SelectContent>
              {QUIZ_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question */}
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <HelpCircle size={10} /> Question
          <span className='normal-case font-normal opacity-70 ml-1'>($...$ for math)</span>
        </label>
        <Textarea
          placeholder='e.g. Evaluate $(g \circ f)(3)$'
          value={block.question}
          onChange={(e) => upd('question', e.target.value)}
          className='text-sm min-h-16 border-input/60'
        />
      </div>

      {/* Graph */}
      <GraphConfigFields graph={block.graph ?? null} onChange={(val) => upd('graph', val)} />

      {/* MC Options */}
      {isMC && (
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <CheckSquare size={10} /> Options <span className='opacity-60 normal-case font-medium'>(click circle = correct)</span>
          </label>
          <div className='space-y-2'>
            {block.options.map((opt, i) => (
              <div key={opt.id} className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => handleOptionCorrect(opt.id)}
                  className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-colors
                    ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-input/60 text-muted-foreground hover:border-emerald-400'}`}
                >
                  {LETTERS[i] ?? i + 1}
                </button>
                <Input
                  placeholder={`Option ${LETTERS[i] ?? i + 1}`}
                  value={opt.text}
                  onChange={(e) => handleOptionText(opt.id, e.target.value)}
                  className='h-9 border-input/60 flex-1'
                />
                <button type='button' onClick={() => handleRemoveOption(opt.id)} className='shrink-0 text-muted-foreground hover:text-destructive transition-colors'>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {block.options.length < 6 && (
              <Button type='button' variant='outline' size='sm' onClick={handleAddOption} className='mt-1 gap-1.5 text-xs'>
                <Plus size={12} /> Add Option
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Short / Math answer */}
      {(isShort || isMath) && (
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <Type size={10} /> Correct Answer
            {isMath && <span className='normal-case font-normal opacity-70 ml-1'>(plain or LaTeX, e.g. -12)</span>}
          </label>
          <Input
            placeholder={isMath ? 'e.g. -12' : 'e.g. SELECT'}
            value={block.correctAnswer}
            onChange={(e) => upd('correctAnswer', e.target.value)}
            className={`h-9 border-input/60 ${isMath ? 'font-mono' : ''}`}
          />
        </div>
      )}

      {/* Hints */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Hints (optional)</label>
          <Button type='button' variant='ghost' size='sm' onClick={handleAddHint} className='h-6 text-xs gap-1 px-2'>
            <Plus size={11} /> Add Hint
          </Button>
        </div>
        {(block.hints ?? []).map((hint, i) => (
          <div key={i} className='flex gap-2 items-center'>
            <Input placeholder={`Hint ${i + 1}`} value={hint} onChange={(e) => handleHintChange(i, e.target.value)} className='h-8 border-input/60 text-sm flex-1' />
            <button type='button' onClick={() => handleRemoveHint(i)} className='text-muted-foreground hover:text-destructive transition-colors'>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <Lightbulb size={10} /> Explanation / Solution
        </label>
        <Textarea
          placeholder='Explain the correct answer... ($...$ math supported)'
          value={block.explanation}
          onChange={(e) => upd('explanation', e.target.value)}
          className='text-sm min-h-16 border-input/60'
        />
      </div>
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
