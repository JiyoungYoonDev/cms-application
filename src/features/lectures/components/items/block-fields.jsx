'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import {
  AlignLeft, PenLine, Trash2, ChevronUp, ChevronDown, Lightbulb, Tag,
} from 'lucide-react';

// ─── Variant config ──────────────────────────────────────────────────────────

const VARIANTS = {
  concept: {
    problemLabel: 'Problem',
    border: 'border-amber-500/20',
    accent: 'text-amber-400/60',
    titlePlaceholder: 'e.g. Practice 1: Solve 3x + 7 = 22',
    titleHint: '(e.g. Practice 1: Apply the formula)',
  },
  checkpoint: {
    problemLabel: 'Checkpoint',
    border: 'border-violet-500/20',
    accent: 'text-violet-400/60',
    titlePlaceholder: 'e.g. Example 1: Solve 3x + 7 = 22',
    titleHint: '(e.g. Example 1: Basic Two-Step Equation)',
  },
};

// ─── Factories ───────────────────────────────────────────────────────────────

function makeTextBlock() {
  return { id: crypto.randomUUID(), type: 'text', content: { type: 'doc', content: [] } };
}

function makeProblemBlock() {
  return {
    id: crypto.randomUUID(),
    type: 'checkpoint',
    title: '',
    question: '',
    answer: '',
    alternatives: '',
    hint: '',
  };
}

// ─── Parse existing content ──────────────────────────────────────────────────

function parseBlockContent(raw) {
  if (!raw) return { blocks: [makeTextBlock()] };
  if (Array.isArray(raw.blocks) && raw.blocks.length > 0) return { blocks: raw.blocks };
  if (raw.type === 'doc') return { blocks: [{ id: 't1', type: 'text', content: raw }] };
  return { blocks: [makeTextBlock()] };
}

// ─── Text Block ──────────────────────────────────────────────────────────────

function TextBlock({ block, onChange }) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1.5'>
        <AlignLeft size={11} className='text-muted-foreground' />
        <span className='text-[10px] font-black uppercase tracking-widest opacity-40'>
          Text / Explanation
        </span>
      </div>
      <SimpleEditor
        initialData={block.content ?? { type: 'doc', content: [] }}
        onChange={(doc) => onChange({ ...block, content: doc })}
      />
    </div>
  );
}

// ─── Problem Block ───────────────────────────────────────────────────────────

function ProblemBlock({ block, onChange, config }) {
  const upd = (field, val) => onChange({ ...block, [field]: val });

  return (
    <div className='space-y-3'>
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <Tag size={10} /> Title
          <span className='normal-case font-normal opacity-70 ml-1'>{config.titleHint}</span>
        </label>
        <Input
          placeholder={config.titlePlaceholder}
          value={block.title || ''}
          onChange={(e) => upd('title', e.target.value)}
          className='h-9 border-input/60 font-semibold'
        />
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <PenLine size={10} /> Question
          <span className='normal-case font-normal opacity-70 ml-1'>($...$ for math)</span>
        </label>
        <Textarea
          placeholder='e.g. What is the solution? Express as $x \leq ?$'
          value={block.question}
          onChange={(e) => upd('question', e.target.value)}
          className='text-sm min-h-14 border-input/60'
        />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            ✓ Answer
            <span className='normal-case font-normal opacity-70 ml-1'>(short: number, expression)</span>
          </label>
          <Input
            placeholder='e.g. x <= 5  or  -3  or  3/4'
            value={block.answer}
            onChange={(e) => upd('answer', e.target.value)}
            className='h-9 border-input/60 font-mono'
          />
        </div>

        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <Lightbulb size={10} /> Hint (optional)
          </label>
          <Input
            placeholder='e.g. Start by adding 5 to both sides'
            value={block.hint}
            onChange={(e) => upd('hint', e.target.value)}
            className='h-9 border-input/60'
          />
        </div>
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          ✓ Accepted Alternatives
          <span className='normal-case font-normal opacity-70 ml-1'>(comma-separated)</span>
        </label>
        <Input
          placeholder='e.g. 5, x = 5, x=5'
          value={block.alternatives || ''}
          onChange={(e) => upd('alternatives', e.target.value)}
          className='h-9 border-input/60 font-mono'
        />
      </div>
    </div>
  );
}

// ─── Insert bar ──────────────────────────────────────────────────────────────

function InsertBar({ onInsertText, onInsertProblem, problemLabel }) {
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
        onClick={onInsertProblem}
        className='flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-input/60 hover:border-input rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap'
      >
        <PenLine size={11} /> {problemLabel}
      </button>
      <div className='flex-1 h-px bg-border/40 group-hover:bg-border transition-colors' />
    </div>
  );
}

// ─── Block wrapper ───────────────────────────────────────────────────────────

function BlockWrapper({ block, index, total, onUpdate, onRemove, onMoveUp, onMoveDown, config }) {
  const isText = block.type === 'text';

  return (
    <div className={`rounded-xl border bg-card/30 p-5 space-y-4 ${isText ? 'border-blue-500/20' : config.border}`}>
      <div className='flex items-center justify-between'>
        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isText ? 'text-blue-400/60' : config.accent}`}>
          {isText ? <AlignLeft size={10} /> : <PenLine size={10} />}
          {isText ? 'Text Block' : config.problemLabel}
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

      {isText
        ? <TextBlock block={block} onChange={onUpdate} />
        : <ProblemBlock block={block} onChange={onUpdate} config={config} />
      }
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function BlockFields({ value, onChange, variant = 'checkpoint' }) {
  const config = VARIANTS[variant] ?? VARIANTS.checkpoint;
  const { blocks } = parseBlockContent(value);

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
      <InsertBar
        onInsertText={() => insertAt(0, makeTextBlock())}
        onInsertProblem={() => insertAt(0, makeProblemBlock())}
        problemLabel={config.problemLabel}
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
            config={config}
          />
          <InsertBar
            onInsertText={() => insertAt(index + 1, makeTextBlock())}
            onInsertProblem={() => insertAt(index + 1, makeProblemBlock())}
            problemLabel={config.problemLabel}
          />
        </div>
      ))}
    </div>
  );
}
