'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateHTML } from '@tiptap/core';
import DOMPurify from 'dompurify';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Node } from '@tiptap/core';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/layout/page-header';
import { useLectureItemById } from '@/features/lectures/hooks';
import { ItemPreviewModal } from '@/features/lectures/components/items/item-preview-modal';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { regenerateItem } from '@/features/courses/services/generation-service';
import { RefreshCw } from 'lucide-react';
import { ScopedValidationPanel } from '@/features/generation/components/scoped-validation-panel';

// Lightweight stand-in nodes for generateHTML (no React view needed)
const MathBlockPreview = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  addAttributes() { return { latex: { default: '' } }; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'math-block', class: 'math-preview' }, HTMLAttributes.latex || ''];
  },
});
const GraphBlockPreview = Node.create({
  name: 'graphBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      expression: { default: '' },
      xMin: { default: -10 }, xMax: { default: 10 },
      yMin: { default: -10 }, yMax: { default: 10 },
      width: { default: 600 }, height: { default: 400 },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'graph-block', class: 'graph-preview' }, `f(x) = ${HTMLAttributes.expression}`];
  },
});
const CheckpointBlockPreview = Node.create({
  name: 'checkpointBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return { question: { default: '' }, answer: { default: '' }, hint: { default: '' }, blockId: { default: '' } };
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'checkpoint-block', class: 'checkpoint-preview' }, `✏️ ${HTMLAttributes.question || 'Checkpoint'}`];
  },
});

const PREVIEW_EXTENSIONS = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight.configure({ multicolor: true }),
  Subscript,
  Superscript,
  Image,
  TaskList,
  TaskItem.configure({ nested: true }),
  MathBlockPreview,
  GraphBlockPreview,
  CheckpointBlockPreview,
];

function parseContent(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    let parsed = JSON.parse(raw);
    // Handle double-stringified JSON from legacy saves
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function TiptapPreview({ doc }) {
  if (!doc?.content?.length) {
    return <p className='text-sm text-muted-foreground italic'>No content</p>;
  }
  try {
    const rawHtml = generateHTML(doc, PREVIEW_EXTENSIONS);
    const safeHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
    return (
      <div
        className='text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_strong]:font-bold [&_em]:italic [&_a]:underline [&_a]:text-primary'
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  } catch (err) {
    console.error('TiptapPreview render error:', err);
    return <p className='text-sm text-muted-foreground italic'>Unable to render content</p>;
  }
}

function QuizSetPreview({ parsed }) {
  // Normalise to blocks (handles new { blocks } and old { quizzes } formats)
  let blocks = [];
  if (Array.isArray(parsed?.blocks)) {
    blocks = parsed.blocks;
  } else if (Array.isArray(parsed?.quizzes)) {
    if (parsed.introduction) blocks.push({ id: 'intro', type: 'text', content: parsed.introduction });
    for (const q of parsed.quizzes) blocks.push({ ...q, type: 'quiz' });
  } else if (parsed?.question !== undefined) {
    blocks = [{ ...parsed, type: 'quiz' }];
  }

  if (blocks.length === 0) return <p className='text-sm text-muted-foreground italic'>No content</p>;

  let quizN = 0;
  return (
    <div className='space-y-4'>
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return (
            <div key={block.id ?? i} className='rounded-lg bg-muted/30 p-3'>
              <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2'>Text Block</p>
              <TiptapPreview doc={block.content} />
            </div>
          );
        }
        quizN++;
        const isMC = block.quizType === 'MULTIPLE_CHOICE';
        return (
          <div key={block.id ?? i} className='rounded-lg border p-4 space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-black uppercase tracking-widest text-muted-foreground'>Problem {quizN}</span>
              <span className='text-[10px] bg-muted px-2 py-0.5 rounded font-mono'>{block.quizType}</span>
              {(block.points ?? 0) > 0 && (
                <span className='text-[10px] text-violet-500 font-bold'>{block.points} XP</span>
              )}
            </div>
            <p className='text-sm font-medium'>{block.question || <em className='text-muted-foreground'>No question</em>}</p>
            {block.graph?.fn1 && (
              <p className='text-xs font-mono text-muted-foreground'>📈 Graph: {block.graph.fn1}{block.graph.fn2 ? `, ${block.graph.fn2}` : ''}</p>
            )}
            {isMC && (
              <ul className='text-xs space-y-0.5 pl-2'>
                {(block.options ?? []).map((o) => (
                  <li key={o.id} className={o.isCorrect ? 'text-emerald-600 font-bold' : 'text-muted-foreground'}>
                    {o.id.toUpperCase()}. {o.text || '—'} {o.isCorrect ? '✓' : ''}
                  </li>
                ))}
              </ul>
            )}
            {!isMC && block.correctAnswer && (
              <p className='text-xs text-emerald-600 font-mono'>Answer: {block.correctAnswer}</p>
            )}
            {block.explanation && (
              <p className='text-xs text-muted-foreground italic'>Explanation: {block.explanation}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectPreview({ parsed }) {
  const isEditor = parsed.submissionType !== 'REPO';
  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-2'>
        <span className='text-xs font-black uppercase tracking-widest text-muted-foreground'>Submission Type</span>
        <span className='text-xs bg-muted px-2 py-0.5 rounded font-mono font-bold'>
          {parsed.submissionType ?? 'EDITOR'}
        </span>
      </div>

      {parsed.description && (
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Description</p>
          <TiptapPreview doc={parsed.description} />
        </div>
      )}

      {Array.isArray(parsed.requirements) && parsed.requirements.filter(Boolean).length > 0 && (
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Requirements</p>
          <ul className='space-y-1'>
            {parsed.requirements.filter(Boolean).map((req, i) => (
              <li key={i} className='flex items-start gap-2 text-sm'>
                <span className='text-muted-foreground font-mono'>{i + 1}.</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isEditor && parsed.language && (
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Language</p>
          <span className='text-sm font-mono bg-muted px-2 py-0.5 rounded'>{parsed.language}</span>
        </div>
      )}

      {isEditor && Array.isArray(parsed.files) && parsed.files.length > 0 && (
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>
            Starter Files ({parsed.files.length})
          </p>
          <div className='space-y-3'>
            {parsed.files.map((f, i) => (
              <div key={f.id ?? i}>
                <p className='text-xs font-mono text-muted-foreground mb-1'>{f.name}</p>
                {f.content && (
                  <pre className='bg-muted rounded-lg p-3 text-sm font-mono whitespace-pre-wrap'>{f.content}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEditor && parsed.fields && (
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Submission Fields</p>
          <ul className='space-y-1 text-sm'>
            {parsed.fields.repoRequired && <li className='text-muted-foreground'>✓ GitHub Repository URL (required)</li>}
            {parsed.fields.demoRequired && <li className='text-muted-foreground'>✓ Live Demo URL (required)</li>}
            {parsed.fields.snippetRequired && <li className='text-muted-foreground'>✓ Code Snippet (required)</li>}
            {parsed.fields.noteLabel && <li className='text-muted-foreground'>✓ Note: "{parsed.fields.noteLabel}"</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function CheckpointPreview({ parsed }) {
  const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : [];
  if (blocks.length === 0) return <p className='text-sm text-muted-foreground italic'>No content</p>;

  let cpN = 0;
  return (
    <div className='space-y-4'>
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return (
            <div key={block.id ?? i} className='rounded-lg bg-muted/30 p-3'>
              <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2'>Text Block</p>
              <TiptapPreview doc={block.content} />
            </div>
          );
        }
        if (block.type === 'checkpoint') {
          cpN++;
          return (
            <div key={block.id ?? i} className='rounded-lg border border-violet-500/30 p-4 space-y-2'>
              <span className='text-xs font-black uppercase tracking-widest text-violet-500/70'>Checkpoint {cpN}</span>
              <p className='text-sm font-medium'>{block.question || <em className='text-muted-foreground'>No question</em>}</p>
              {block.answer && <p className='text-xs text-emerald-600 font-mono'>Answer: {block.answer}</p>}
              {block.hint && <p className='text-xs text-amber-500 italic'>Hint: {block.hint}</p>}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function ContentPreview({ content, itemType }) {
  const parsed = parseContent(content);
  if (!parsed) {
    return <p className='text-sm text-muted-foreground italic'>No content</p>;
  }

  // CHECKPOINT
  if (itemType === 'CHECKPOINT') {
    return <CheckpointPreview parsed={parsed} />;
  }

  // QUIZ_SET / TEST_BLOCK — same blocks structure
  if (itemType === 'QUIZ_SET' || itemType === 'TEST_BLOCK') {
    return <QuizSetPreview parsed={parsed} />;
  }

  // PROJECT
  if (itemType === 'PROJECT') {
    return <ProjectPreview parsed={parsed} />;
  }

  // CODING_SET: multi-problem format { problems[] } or legacy single-problem
  if (itemType === 'CODING_SET') {
    const problems = Array.isArray(parsed.problems)
      ? parsed.problems
      : [{ ...parsed, files: parsed.fileName ? [{ name: parsed.fileName, content: parsed.starterCode ?? '' }] : [] }];

    return (
      <div className='space-y-6'>
        {problems.map((problem, idx) => {
          const files = Array.isArray(problem.files) && problem.files.length > 0
            ? problem.files
            : problem.fileName ? [{ name: problem.fileName, content: problem.starterCode ?? '' }] : [];

          return (
            <div key={problem.id ?? idx} className='rounded-xl border p-5 space-y-4'>
              <div className='flex items-center gap-3'>
                <span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
                  Problem {idx + 1}
                </span>
                {problem.title && <span className='text-sm font-medium'>{problem.title}</span>}
                {problem.language && (
                  <span className='text-[10px] bg-muted px-2 py-0.5 rounded font-mono'>{problem.language}</span>
                )}
                {(problem.points ?? 0) > 0 && (
                  <span className='text-[10px] text-violet-500 font-bold'>{problem.points} XP</span>
                )}
              </div>

              {problem.description && (
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Description</p>
                  <TiptapPreview doc={problem.description} />
                </div>
              )}

              {files.length > 0 && (
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>
                    Files ({files.length})
                  </p>
                  <div className='space-y-3'>
                    {files.map((f, fi) => (
                      <div key={f.id ?? fi}>
                        <p className='text-xs font-mono text-muted-foreground mb-1'>{f.name}</p>
                        {f.content && (
                          <pre className='bg-muted rounded-lg p-3 text-sm font-mono whitespace-pre-wrap'>{f.content}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(problem.testCases) && problem.testCases.length > 0 && (
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>
                    Test Cases ({problem.testCases.length})
                    {problem.functionName && (
                      <span className='ml-2 text-violet-500 normal-case tracking-normal font-mono'>
                        fn: {problem.functionName}()
                      </span>
                    )}
                    {problem.evaluationStyle && (
                      <span className='ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded normal-case tracking-normal'>
                        {problem.evaluationStyle}
                      </span>
                    )}
                  </p>
                  <div className='space-y-2'>
                    {problem.testCases.map((tc, ti) => {
                      // Function-based stored with args/expected, console with input/expectedOutput
                      const isFn = Array.isArray(tc.args);
                      return (
                        <div key={ti} className='rounded-lg border bg-muted/30 p-3 space-y-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-bold text-muted-foreground'>Test {ti + 1}</span>
                          </div>
                          <div className='grid grid-cols-2 gap-3 text-xs font-mono'>
                            <div>
                              <span className='text-muted-foreground font-sans font-bold'>
                                {isFn ? 'Args' : 'Input'}
                              </span>
                              <pre className='mt-1 bg-muted rounded px-2 py-1.5 whitespace-pre-wrap min-h-[28px]'>
                                {isFn
                                  ? JSON.stringify(tc.args)
                                  : (tc.input || <span className='text-muted-foreground italic font-sans'>(no stdin)</span>)}
                              </pre>
                            </div>
                            <div>
                              <span className='text-muted-foreground font-sans font-bold'>
                                {isFn ? 'Expected Return' : 'Expected Output'}
                              </span>
                              <pre className='mt-1 bg-muted rounded px-2 py-1.5 whitespace-pre-wrap min-h-[28px]'>
                                {isFn ? JSON.stringify(tc.expected) : tc.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {problem.expectedOutput && !problem.testCases?.length && (
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Expected Output</p>
                  <pre className='bg-muted rounded-lg p-3 text-sm font-mono whitespace-pre-wrap'>{problem.expectedOutput}</pre>
                </div>
              )}

              {Array.isArray(problem.hints) && problem.hints.length > 0 && (
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Hints</p>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    {problem.hints.map((h, hi) => (
                      <li key={hi} className='flex gap-2'>
                        <span className='text-amber-500'>💡</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Default: use full editor in read-only mode (supports math/graph nodes)
  return <SimpleEditor initialData={parsed} readOnly />;
}

export default function LectureItemDetailPage({ params }) {
  const router = useRouter();
  const { courseId, sectionId, lectureId, itemId } = use(params);
  const [regenerating, setRegenerating] = useState(false);
  const [regenResult, setRegenResult] = useState(null);

  const { data, isLoading, refetch } = useLectureItemById(itemId);
  const item = data?.data ?? data;

  const lecturePath = `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`;

  async function handleRegenerate() {
    if (regenerating) return;
    if (!window.confirm(`"${item?.title}" 의 콘텐츠를 다시 생성하시겠습니까?`)) return;
    setRegenerating(true);
    setRegenResult(null);
    try {
      const res = await regenerateItem(itemId);
      const output = res?.data;
      setRegenResult({
        success: true,
        message: `Regenerated successfully. Output ID: ${output?.outputId ?? 'N/A'}, Strategy: ${output?.parseStrategy ?? 'N/A'}, Tokens: ${output?.promptTokens ?? 0}+${output?.completionTokens ?? 0}`,
        outputId: output?.outputId,
      });
      refetch?.();
    } catch (e) {
      setRegenResult({ success: false, message: e?.message || 'Regeneration failed.' });
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8 py-8'>
      <Header
        title={isLoading ? 'Loading...' : (item?.title || 'Item')}
        description={item?.itemType ?? ''}
        actions={
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => router.push(lecturePath)}>
              Back
            </Button>
            <ItemPreviewModal item={item} isLoading={isLoading} />
            <Button
              size='sm'
              variant='outline'
              onClick={handleRegenerate}
              disabled={regenerating || isLoading}
              className='gap-1.5'
            >
              <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Generating...' : 'Regenerate'}
            </Button>
            <Button
              size='sm'
              onClick={() =>
                router.push(
                  `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/items/${itemId}/edit`,
                )
              }
            >
              Edit
            </Button>
          </div>
        }
      />

      {regenResult && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${regenResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {regenResult.message}
        </div>
      )}

      <section className='rounded-2xl border bg-card p-6 shadow-sm'>
        <ContentPreview content={item?.contentJson ?? item?.content} itemType={item?.itemType} />
      </section>

      <section className='rounded-2xl border bg-card p-6 shadow-sm'>
        <ScopedValidationPanel scopeType='ITEM' targetId={itemId} />
      </section>
    </div>
  );
}
