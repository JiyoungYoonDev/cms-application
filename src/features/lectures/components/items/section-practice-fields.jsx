'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
  HelpCircle, Code, Type,
} from 'lucide-react';
import { McqEditor, ShortAnswerEditor, CodingEditor } from './section-practice-editors';

// ─── Types ────────────────────────────────────────────────────────────────────

const PRACTICE_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'CODING', label: 'Coding' },
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
