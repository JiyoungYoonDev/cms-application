'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
  HelpCircle, Code, Type, Lightbulb, CheckSquare,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

const PRACTICE_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'CODING', label: 'Coding' },
];

const EVAL_STYLES = [
  { value: 'FUNCTION', label: 'Function' },
  { value: 'CONSOLE', label: 'Console (stdin)' },
];

// ─── Factories ────────────────────────────────────────────────────────────────

function makePracticeItem(type = 'MCQ') {
  const base = { type };
  if (type === 'MCQ') {
    return {
      ...base,
      question: '',
      options: [
        { letter: 'A', text: '' },
        { letter: 'B', text: '' },
        { letter: 'C', text: '' },
        { letter: 'D', text: '' },
      ],
      answer: '',
      explanation: '',
    };
  }
  if (type === 'SHORT_ANSWER') {
    return { ...base, question: '', answer: '', hint: '', explanation: '' };
  }
  // CODING
  return {
    ...base,
    title: '',
    description: '',
    language: 'python',
    evaluationStyle: 'FUNCTION',
    functionName: '',
    starterCode: '',
    testCases: [{ input: '', expectedOutput: '' }],
    hint: '',
  };
}

function makeSection() {
  return { sectionTitle: '', practice: [makePracticeItem('MCQ')] };
}

// ─── Parse ────────────────────────────────────────────────────────────────────

function parseSectionPractice(raw) {
  if (Array.isArray(raw) && raw.length > 0) return raw;
  return [];
}

// ─── MCQ Item Editor ──────────────────────────────────────────────────────────

function McqEditor({ item, onChange }) {
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

function ShortAnswerEditor({ item, onChange }) {
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

function CodingEditor({ item, onChange }) {
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

// ─── Practice Item Card ───────────────────────────────────────────────────────

function PracticeItemCard({ item, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [collapsed, setCollapsed] = useState(false);

  const typeIcons = { MCQ: HelpCircle, SHORT_ANSWER: Type, CODING: Code };
  const Icon = typeIcons[item.type] ?? HelpCircle;

  const handleTypeChange = (newType) => {
    // Keep common fields, reset type-specific ones
    onChange(makePracticeItem(newType));
  };

  return (
    <div className='rounded-xl border border-violet-500/20 bg-card/30 p-4 space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <button type='button' onClick={() => setCollapsed(v => !v)} className='text-muted-foreground hover:text-foreground transition-colors'>
            <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-90'}`} />
          </button>
          <Icon size={12} className='text-violet-400/60' />
          <span className='text-[10px] font-black uppercase tracking-widest text-violet-400/60'>
            Problem {index + 1}
          </span>
          <Select value={item.type} onValueChange={handleTypeChange}>
            <SelectTrigger className='h-6 w-36 border-input/40 text-[10px] px-2'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRACTICE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
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

      {/* Content (collapsible) */}
      {!collapsed && (
        <>
          {item.type === 'MCQ' && <McqEditor item={item} onChange={onChange} />}
          {item.type === 'SHORT_ANSWER' && <ShortAnswerEditor item={item} onChange={onChange} />}
          {item.type === 'CODING' && <CodingEditor item={item} onChange={onChange} />}
        </>
      )}
    </div>
  );
}

// ─── Section Group ────────────────────────────────────────────────────────────

function SectionGroup({ section, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [collapsed, setCollapsed] = useState(false);

  const updateTitle = (title) => onChange({ ...section, sectionTitle: title });
  const updateItem = (i, updated) => {
    const practice = [...section.practice];
    practice[i] = updated;
    onChange({ ...section, practice });
  };
  const removeItem = (i) => {
    if (section.practice.length <= 1) return;
    onChange({ ...section, practice: section.practice.filter((_, idx) => idx !== i) });
  };
  const addItem = (type = 'MCQ') => {
    onChange({ ...section, practice: [...section.practice, makePracticeItem(type)] });
  };
  const moveItem = (i, dir) => {
    const practice = [...section.practice];
    const target = i + dir;
    if (target < 0 || target >= practice.length) return;
    [practice[i], practice[target]] = [practice[target], practice[i]];
    onChange({ ...section, practice });
  };

  return (
    <div className='rounded-2xl border border-border bg-card/20 p-5 space-y-4'>
      {/* Section header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 flex-1'>
          <button type='button' onClick={() => setCollapsed(v => !v)} className='text-muted-foreground hover:text-foreground transition-colors'>
            <ChevronRight size={16} className={`transition-transform ${collapsed ? '' : 'rotate-90'}`} />
          </button>
          <span className='text-[10px] font-black uppercase tracking-widest text-blue-400/60 shrink-0'>
            Section {index + 1}
          </span>
          <Input
            placeholder='Section title (must match h2 heading)'
            value={section.sectionTitle ?? ''}
            onChange={(e) => updateTitle(e.target.value)}
            className='h-8 border-input/60 text-sm font-semibold flex-1'
          />
        </div>
        <div className='flex items-center gap-1 ml-2'>
          <button type='button' onClick={onMoveUp} disabled={index === 0} className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors'>
            <ChevronUp size={14} />
          </button>
          <button type='button' onClick={onMoveDown} disabled={index === total - 1} className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors'>
            <ChevronDown size={14} />
          </button>
          <button type='button' onClick={onRemove} className='p-1 text-muted-foreground hover:text-destructive transition-colors'>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Practice items */}
      {!collapsed && (
        <div className='space-y-3 pl-6'>
          {section.practice.map((item, i) => (
            <PracticeItemCard
              key={i}
              item={item}
              index={i}
              total={section.practice.length}
              onChange={(updated) => updateItem(i, updated)}
              onRemove={() => removeItem(i)}
              onMoveUp={() => moveItem(i, -1)}
              onMoveDown={() => moveItem(i, 1)}
            />
          ))}
          <div className='flex gap-2'>
            <Button type='button' variant='outline' size='sm' onClick={() => addItem('MCQ')} className='text-xs gap-1'>
              <Plus size={11} /> MCQ
            </Button>
            <Button type='button' variant='outline' size='sm' onClick={() => addItem('SHORT_ANSWER')} className='text-xs gap-1'>
              <Plus size={11} /> Short Answer
            </Button>
            <Button type='button' variant='outline' size='sm' onClick={() => addItem('CODING')} className='text-xs gap-1'>
              <Plus size={11} /> Coding
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function SectionPracticeFields({ value, onChange }) {
  const sections = parseSectionPractice(value);

  function updateSection(index, updated) {
    const next = [...sections];
    next[index] = updated;
    onChange(next);
  }

  function removeSection(index) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function addSection() {
    onChange([...sections, makeSection()]);
  }

  function moveSection(index, direction) {
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-semibold'>Section Practice</h3>
          <p className='text-xs text-muted-foreground'>
            Inline practice problems shown after each content section. Section titles must match h2 headings.
          </p>
        </div>
        <Button type='button' variant='outline' size='sm' onClick={addSection} className='gap-1.5 text-xs'>
          <Plus size={12} /> Add Section
        </Button>
      </div>

      {sections.length === 0 && (
        <div className='text-center py-6 text-sm text-muted-foreground border border-dashed rounded-xl'>
          No section practice items. Click "Add Section" to create inline practice.
        </div>
      )}

      {sections.map((section, i) => (
        <SectionGroup
          key={i}
          section={section}
          index={i}
          total={sections.length}
          onChange={(updated) => updateSection(i, updated)}
          onRemove={() => removeSection(i)}
          onMoveUp={() => moveSection(i, -1)}
          onMoveDown={() => moveSection(i, 1)}
        />
      ))}
    </div>
  );
}
