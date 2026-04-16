'use client';

import { TiptapDark } from './preview-tiptap';
import { QuizSetRenderer } from './preview-quiz-renderer';
import { CodingSetRenderer } from './preview-coding-renderer';
import { CheckpointRenderer } from './preview-checkpoint-renderer';
import { ProjectRenderer } from './preview-project-renderer';

function parseContent(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    let parsed = JSON.parse(raw);
    // Handle double-stringified JSON from legacy saves
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Unified item content renderer — used by both the student preview modal
 * and the admin inspection page.
 *
 * @param {object} props
 * @param {object} props.item           - lecture item with contentJson/content + itemType
 * @param {boolean} [props.showSolutions=false] - when true, quizzes/checkpoints
 *   reveal correct answers + explanations up-front (admin inspection mode).
 *   Student preview passes false so learners have to submit to see feedback.
 */
export function ItemContentRenderer({ item, showSolutions = false }) {
  if (!item) return <p className='text-sm text-[#5a5a72]'>No content</p>;

  const parsed = parseContent(item.contentJson ?? item.content);
  if (!parsed) return <p className='text-sm text-[#5a5a72]'>No content</p>;

  switch (item.itemType) {
    case 'QUIZ_SET':
    case 'TEST_BLOCK':
      return <QuizSetRenderer contentJson={parsed} initialShowSolutions={showSolutions} />;
    case 'CODING_SET':
      return <CodingSetRenderer contentJson={parsed} />;
    case 'CHECKPOINT':
      return <CheckpointRenderer contentJson={parsed} showSolutions={showSolutions} />;
    case 'PROJECT':
      return <ProjectRenderer contentJson={parsed} />;
    default:
      // Plain lecture content — Tiptap doc
      return <TiptapDark doc={parsed} />;
  }
}
