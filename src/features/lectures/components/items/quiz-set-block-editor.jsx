'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckSquare, HelpCircle, Lightbulb, Plus, Trash2, Type, X, BarChart2,
} from 'lucide-react';

const QUIZ_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER',    label: 'Short Answer' },
  { value: 'MATH_INPUT',      label: 'Math Input (with keyboard)' },
];

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

// ─── Quiz Block ────────────────────────────────────────────────────────────────

export function QuizBlock({ block, onChange }) {
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
              <div key={`${opt.id}-${i}`} className='flex items-center gap-3'>
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
