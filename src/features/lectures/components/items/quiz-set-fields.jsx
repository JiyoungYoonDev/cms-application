'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckSquare, HelpCircle, Lightbulb, Plus, Trash2, Type, X } from 'lucide-react';

const QUIZ_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER', label: 'Short Answer (Typing)' },
];

function makeEmptyQuiz() {
  return {
    id: crypto.randomUUID(),
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
  };
}

export function parseQuizContent(raw) {
  if (!raw) return { quizzes: [makeEmptyQuiz()] };
  // New format: has quizzes array
  if (Array.isArray(raw.quizzes)) {
    return { quizzes: raw.quizzes.length > 0 ? raw.quizzes : [makeEmptyQuiz()] };
  }
  // Old format: single quiz fields — wrap in array
  if (raw.question !== undefined || raw.quizType !== undefined) {
    return {
      quizzes: [{
        id: crypto.randomUUID(),
        quizType: raw.quizType ?? 'MULTIPLE_CHOICE',
        question: raw.question ?? '',
        options: raw.options ?? [
          { id: 'a', text: '', isCorrect: false },
          { id: 'b', text: '', isCorrect: false },
        ],
        correctAnswer: raw.correctAnswer ?? '',
        explanation: raw.explanation ?? '',
        hints: raw.hints ?? [],
        points: raw.points ?? 30,
      }],
    };
  }
  return { quizzes: [makeEmptyQuiz()] };
}

function OptionRow({ option, index, onTextChange, onCorrectToggle, onRemove }) {
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  return (
    <div className='flex items-center gap-3'>
      <button
        type='button'
        onClick={() => onCorrectToggle(option.id)}
        title={option.isCorrect ? 'Mark as wrong' : 'Mark as correct'}
        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-colors
          ${option.isCorrect
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-input/60 text-muted-foreground hover:border-emerald-400'
          }`}
      >
        {LETTERS[index] ?? index + 1}
      </button>
      <Input
        placeholder={`Option ${LETTERS[index] ?? index + 1}`}
        value={option.text}
        onChange={(e) => onTextChange(option.id, e.target.value)}
        className='h-9 border-input/60 flex-1'
      />
      <button
        type='button'
        onClick={() => onRemove(option.id)}
        className='shrink-0 text-muted-foreground hover:text-destructive transition-colors'
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function SingleQuizFields({ quiz, index, total, onChange, onRemove }) {
  const update = (field, val) => onChange({ ...quiz, [field]: val });

  const handleOptionText = (id, text) =>
    update('options', quiz.options.map((o) => (o.id === id ? { ...o, text } : o)));

  const handleOptionCorrect = (id) =>
    update('options', quiz.options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));

  const handleAddOption = () => {
    const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const nextId = LETTERS[quiz.options.length] ?? String(quiz.options.length);
    update('options', [...quiz.options, { id: nextId, text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (id) => {
    if (quiz.options.length <= 2) return;
    update('options', quiz.options.filter((o) => o.id !== id));
  };

  const handleAddHint = () => update('hints', [...(quiz.hints ?? []), '']);

  const handleHintChange = (i, val) => {
    const next = [...(quiz.hints ?? [])];
    next[i] = val;
    update('hints', next);
  };

  const handleRemoveHint = (i) =>
    update('hints', (quiz.hints ?? []).filter((_, idx) => idx !== i));

  return (
    <div className='rounded-xl border bg-card/30 p-5 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <span className='text-xs font-black uppercase tracking-widest text-muted-foreground'>
          Quiz {index + 1}
        </span>
        {total > 1 && (
          <button
            type='button'
            onClick={onRemove}
            className='text-muted-foreground hover:text-destructive transition-colors'
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Points + Quiz Type */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Points</label>
          <Input
            type='number'
            value={quiz.points ?? 30}
            onChange={(e) => update('points', Number(e.target.value))}
            className='h-9 border-input/60 font-mono'
          />
        </div>
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <CheckSquare size={10} /> Quiz Type
          </label>
          <Select value={quiz.quizType} onValueChange={(val) => update('quizType', val)}>
            <SelectTrigger className='h-9 border-input/60'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUIZ_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question */}
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <HelpCircle size={10} /> Question
        </label>
        <Textarea
          placeholder='e.g. Which of the following is a valid SQL keyword?'
          value={quiz.question}
          onChange={(e) => update('question', e.target.value)}
          className='text-sm min-h-16 border-input/60'
        />
      </div>

      {/* Multiple Choice Options */}
      {quiz.quizType === 'MULTIPLE_CHOICE' && (
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <CheckSquare size={10} /> Options
            <span className='opacity-60 normal-case font-medium'>(click circle to mark correct)</span>
          </label>
          <div className='space-y-2'>
            {quiz.options.map((option, i) => (
              <OptionRow
                key={option.id}
                option={option}
                index={i}
                onTextChange={handleOptionText}
                onCorrectToggle={handleOptionCorrect}
                onRemove={handleRemoveOption}
              />
            ))}
            {quiz.options.length < 6 && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddOption}
                className='mt-1 gap-1.5 text-xs'
              >
                <Plus size={12} /> Add Option
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Short Answer */}
      {quiz.quizType === 'SHORT_ANSWER' && (
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <Type size={10} /> Correct Answer
          </label>
          <Input
            placeholder='e.g. SELECT'
            value={quiz.correctAnswer}
            onChange={(e) => update('correctAnswer', e.target.value)}
            className='h-9 border-input/60'
          />
        </div>
      )}

      {/* Hints */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>
            Hints (optional)
          </label>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleAddHint}
            className='h-6 text-xs gap-1 px-2'
          >
            <Plus size={11} /> Add Hint
          </Button>
        </div>
        {(quiz.hints ?? []).map((hint, i) => (
          <div key={i} className='flex gap-2 items-center'>
            <Input
              placeholder={`Hint ${i + 1}`}
              value={hint}
              onChange={(e) => handleHintChange(i, e.target.value)}
              className='h-8 border-input/60 text-sm flex-1'
            />
            <button
              type='button'
              onClick={() => handleRemoveHint(i)}
              className='text-muted-foreground hover:text-destructive transition-colors'
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <Lightbulb size={10} /> Explanation (shown after answer)
        </label>
        <Textarea
          placeholder='Explain the correct answer...'
          value={quiz.explanation}
          onChange={(e) => update('explanation', e.target.value)}
          className='text-sm min-h-16 border-input/60'
        />
      </div>
    </div>
  );
}

export function QuizSetFields({ value, onChange }) {
  const content = parseQuizContent(value);

  const updateQuiz = (index, updated) => {
    const next = [...content.quizzes];
    next[index] = updated;
    onChange({ ...content, quizzes: next });
  };

  const removeQuiz = (index) => {
    const next = content.quizzes.filter((_, i) => i !== index);
    onChange({ ...content, quizzes: next });
  };

  const addQuiz = () => {
    onChange({ ...content, quizzes: [...content.quizzes, makeEmptyQuiz()] });
  };

  return (
    <div className='space-y-4'>
      {content.quizzes.map((quiz, index) => (
        <SingleQuizFields
          key={quiz.id}
          quiz={quiz}
          index={index}
          total={content.quizzes.length}
          onChange={(updated) => updateQuiz(index, updated)}
          onRemove={() => removeQuiz(index)}
        />
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={addQuiz}
        className='gap-1.5 text-xs'
      >
        <Plus size={13} /> Add Quiz
      </Button>
    </div>
  );
}
