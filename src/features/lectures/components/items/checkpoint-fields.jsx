'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import {
  AlignLeft, PenLine, Plus, Trash2, ChevronUp, ChevronDown, Lightbulb, Tag,
} from 'lucide-react';

// ─── Factories ────────────────────────────────────────────────────────────────

function makeTextBlock() {
  return { id: crypto.randomUUID(), type: 'text', content: { type: 'doc', content: [] } };
}

function makeCheckpointBlock() {
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

// ─── Parse existing content ───────────────────────────────────────────────────

function parseCheckpointContent(raw) {
  if (!raw) return { blocks: [makeTextBlock()] };
  if (Array.isArray(raw.blocks) && raw.blocks.length > 0) return { blocks: raw.blocks };
  // Tiptap doc format (from AI generation) — wrap as single text block
  if (raw.type === 'doc') return { blocks: [{ id: 't1', type: 'text', content: raw }] };
  return { blocks: [makeTextBlock()] };
}

// ─── Text Block ───────────────────────────────────────────────────────────────

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

// ─── Checkpoint Block ─────────────────────────────────────────────────────────

function CheckpointBlock({ block, onChange }) {
  const upd = (field, val) => onChange({ ...block, [field]: val });

  return (
    <div className='space-y-3'>
      {/* Title */}
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <Tag size={10} /> Title
          <span className='normal-case font-normal opacity-70 ml-1'>(e.g. Example 1: Basic Two-Step Equation)</span>
        </label>
        <Input
          placeholder='e.g. Example 1: Solve 3x + 7 = 22'
          value={block.title || ''}
          onChange={(e) => upd('title', e.target.value)}
          className='h-9 border-input/60 font-semibold'
        />
      </div>

      {/* Question */}
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
        {/* Answer */}
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

        {/* Hint */}
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

      {/* Alternative answers */}
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          ✓ Accepted Alternatives
          <span className='normal-case font-normal opacity-70 ml-1'>(comma-separated, e.g. answer is x=5 → alternatives: 5, x = 5)</span>
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

// ─── Insert bar ───────────────────────────────────────────────────────────────

function InsertBar({ onInsertText, onInsertCheckpoint }) {
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
        onClick={onInsertCheckpoint}
        className='flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-input/60 hover:border-input rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap'
      >
        <PenLine size={11} /> Checkpoint
      </button>
      <div className='flex-1 h-px bg-border/40 group-hover:bg-border transition-colors' />
    </div>
  );
}

// ─── Block wrapper ────────────────────────────────────────────────────────────

function BlockWrapper({ block, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const isText = block.type === 'text';

  return (
    <div className={`rounded-xl border bg-card/30 p-5 space-y-4 ${isText ? 'border-blue-500/20' : 'border-violet-500/20'}`}>
      <div className='flex items-center justify-between'>
        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isText ? 'text-blue-400/60' : 'text-violet-400/60'}`}>
          {isText ? <AlignLeft size={10} /> : <PenLine size={10} />}
          {isText ? 'Text Block' : 'Checkpoint'}
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
        : <CheckpointBlock block={block} onChange={onUpdate} />
      }
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function CheckpointFields({ value, onChange }) {
  const { blocks } = parseCheckpointContent(value);

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
        onInsertCheckpoint={() => insertAt(0, makeCheckpointBlock())}
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
            onInsertCheckpoint={() => insertAt(index + 1, makeCheckpointBlock())}
          />
        </div>
      ))}
    </div>
  );
}
