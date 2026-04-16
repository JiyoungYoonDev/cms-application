'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Lightbulb, CheckSquare } from 'lucide-react';

const EVAL_STYLES = [
  { value: 'FUNCTION', label: 'Function' },
  { value: 'CONSOLE', label: 'Console (stdin)' },
];

// ─── MCQ Item Editor ──────────────────────────────────────────────────────────

export function McqEditor({ item, onChange }) {
  const upd = (field, val) => onChange({ ...item, [field]: val });
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className='space-y-3'>
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Question</label>
        <Textarea
          placeholder='e.g. What is the output of this code?'
          value={item.question ?? ''}
          onChange={(e) => upd('question', e.target.value)}
          className='text-sm min-h-14 border-input/60'
        />
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <CheckSquare size={10} /> Options
          <span className='normal-case font-normal opacity-70 ml-1'>(set correct answer below)</span>
        </label>
        <div className='space-y-2'>
          {(item.options ?? []).map((opt, i) => (
            <div key={opt.letter} className='flex items-center gap-2'>
              <span className='shrink-0 w-6 h-6 rounded-full border border-input/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground'>
                {opt.letter}
              </span>
              <Input
                placeholder={`Option ${opt.letter}`}
                value={opt.text}
                onChange={(e) => {
                  const opts = [...(item.options ?? [])];
                  opts[i] = { ...opts[i], text: e.target.value };
                  upd('options', opts);
                }}
                className='h-8 border-input/60 flex-1 text-sm'
              />
              {(item.options ?? []).length > 2 && (
                <button
                  type='button'
                  onClick={() => upd('options', (item.options ?? []).filter((_, idx) => idx !== i))}
                  className='text-muted-foreground hover:text-destructive transition-colors'
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          {(item.options ?? []).length < 6 && (
            <Button
              type='button' variant='outline' size='sm'
              onClick={() => {
                const nextLetter = LETTERS[(item.options ?? []).length] ?? '?';
                upd('options', [...(item.options ?? []), { letter: nextLetter, text: '' }]);
              }}
              className='text-xs gap-1'
            >
              <Plus size={11} /> Add Option
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Correct Answer (letter)</label>
          <Select value={item.answer ?? ''} onValueChange={(val) => upd('answer', val)}>
            <SelectTrigger className='h-8 border-input/60 text-sm'><SelectValue placeholder='Select' /></SelectTrigger>
            <SelectContent>
              {(item.options ?? []).map((opt) => (
                <SelectItem key={opt.letter} value={opt.letter}>{opt.letter}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div />
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Explanation</label>
        <Textarea
          placeholder='Why is this the correct answer?'
          value={item.explanation ?? ''}
          onChange={(e) => upd('explanation', e.target.value)}
          className='text-sm min-h-12 border-input/60'
        />
      </div>
    </div>
  );
}

// ─── Short Answer Editor ──────────────────────────────────────────────────────

export function ShortAnswerEditor({ item, onChange }) {
  const upd = (field, val) => onChange({ ...item, [field]: val });

  return (
    <div className='space-y-3'>
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Question</label>
        <Textarea
          placeholder='e.g. What keyword is used to declare a constant in Java?'
          value={item.question ?? ''}
          onChange={(e) => upd('question', e.target.value)}
          className='text-sm min-h-14 border-input/60'
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Answer</label>
          <Input
            placeholder='e.g. final'
            value={item.answer ?? ''}
            onChange={(e) => upd('answer', e.target.value)}
            className='h-8 border-input/60 text-sm font-mono'
          />
        </div>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <Lightbulb size={10} /> Hint
          </label>
          <Input
            placeholder='Optional hint'
            value={item.hint ?? ''}
            onChange={(e) => upd('hint', e.target.value)}
            className='h-8 border-input/60 text-sm'
          />
        </div>
      </div>
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Explanation</label>
        <Textarea
          placeholder='Explanation of the answer'
          value={item.explanation ?? ''}
          onChange={(e) => upd('explanation', e.target.value)}
          className='text-sm min-h-12 border-input/60'
        />
      </div>
    </div>
  );
}

// ─── Coding Editor ────────────────────────────────────────────────────────────

export function CodingEditor({ item, onChange }) {
  const upd = (field, val) => onChange({ ...item, [field]: val });

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Title</label>
          <Input
            placeholder='e.g. Sum Two Numbers'
            value={item.title ?? ''}
            onChange={(e) => upd('title', e.target.value)}
            className='h-8 border-input/60 text-sm'
          />
        </div>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Language</label>
          <Input
            placeholder='python'
            value={item.language ?? 'python'}
            onChange={(e) => upd('language', e.target.value)}
            className='h-8 border-input/60 text-sm font-mono'
          />
        </div>
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Description</label>
        <Textarea
          placeholder='Describe what the function should do'
          value={item.description ?? ''}
          onChange={(e) => upd('description', e.target.value)}
          className='text-sm min-h-12 border-input/60'
        />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Evaluation Style</label>
          <Select value={item.evaluationStyle ?? 'FUNCTION'} onValueChange={(val) => upd('evaluationStyle', val)}>
            <SelectTrigger className='h-8 border-input/60 text-sm'><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVAL_STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(item.evaluationStyle ?? 'FUNCTION') === 'FUNCTION' && (
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Function Name</label>
            <Input
              placeholder='e.g. sum_two'
              value={item.functionName ?? ''}
              onChange={(e) => upd('functionName', e.target.value)}
              className='h-8 border-input/60 text-sm font-mono'
            />
          </div>
        )}
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Starter Code</label>
        <Textarea
          placeholder='def sum_two(a, b):\n    pass'
          value={item.starterCode ?? ''}
          onChange={(e) => upd('starterCode', e.target.value)}
          className='text-sm min-h-16 border-input/60 font-mono'
        />
      </div>

      {/* Test Cases */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Test Cases</label>
          <Button
            type='button' variant='ghost' size='sm'
            onClick={() => upd('testCases', [...(item.testCases ?? []), { input: '', expectedOutput: '' }])}
            className='h-6 text-xs gap-1 px-2'
          >
            <Plus size={11} /> Add
          </Button>
        </div>
        {(item.testCases ?? []).map((tc, i) => (
          <div key={i} className='flex gap-2 items-center'>
            <Input
              placeholder='Input e.g. [3, 5]'
              value={tc.input}
              onChange={(e) => {
                const tcs = [...(item.testCases ?? [])];
                tcs[i] = { ...tcs[i], input: e.target.value };
                upd('testCases', tcs);
              }}
              className='h-8 border-input/60 text-xs font-mono flex-1'
            />
            <Input
              placeholder='Expected e.g. 8'
              value={tc.expectedOutput}
              onChange={(e) => {
                const tcs = [...(item.testCases ?? [])];
                tcs[i] = { ...tcs[i], expectedOutput: e.target.value };
                upd('testCases', tcs);
              }}
              className='h-8 border-input/60 text-xs font-mono flex-1'
            />
            <button
              type='button'
              onClick={() => {
                if ((item.testCases ?? []).length > 1) {
                  upd('testCases', (item.testCases ?? []).filter((_, idx) => idx !== i));
                }
              }}
              className='text-muted-foreground hover:text-destructive transition-colors'
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <Lightbulb size={10} /> Hint
        </label>
        <Input
          placeholder='Optional hint'
          value={item.hint ?? ''}
          onChange={(e) => upd('hint', e.target.value)}
          className='h-8 border-input/60 text-sm'
        />
      </div>
    </div>
  );
}
