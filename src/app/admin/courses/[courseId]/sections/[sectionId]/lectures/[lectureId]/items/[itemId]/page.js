'use client';

import { use } from 'react';
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
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/layout/page-header';
import { useLectureItemById } from '@/features/lectures/hooks';

const PREVIEW_EXTENSIONS = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight.configure({ multicolor: true }),
  Subscript,
  Superscript,
  Image,
  TaskList,
  TaskItem.configure({ nested: true }),
];

function parseContent(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
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
  } catch {
    return <p className='text-sm text-muted-foreground italic'>Unable to render content</p>;
  }
}

function ContentPreview({ content, itemType }) {
  const parsed = parseContent(content);
  if (!parsed) {
    return <p className='text-sm text-muted-foreground italic'>No content</p>;
  }

  // CODING_SET: wrapper format
  if (itemType === 'CODING_SET') {
    return (
      <div className='space-y-6'>
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Description</p>
          <TiptapPreview doc={parsed.description} />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1'>Language</p>
            <p className='text-sm font-mono'>{parsed.language ?? '—'}</p>
          </div>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1'>File Name</p>
            <p className='text-sm font-mono'>{parsed.fileName ?? '—'}</p>
          </div>
        </div>
        {parsed.starterCode && (
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Starter Code</p>
            <pre className='bg-muted rounded-lg p-3 text-sm font-mono whitespace-pre-wrap'>{parsed.starterCode}</pre>
          </div>
        )}
        {parsed.expectedOutput && (
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2'>Expected Output</p>
            <pre className='bg-muted rounded-lg p-3 text-sm font-mono whitespace-pre-wrap'>{parsed.expectedOutput}</pre>
          </div>
        )}
      </div>
    );
  }

  // Default: bare Tiptap doc
  return <TiptapPreview doc={parsed} />;
}

export default function LectureItemDetailPage({ params }) {
  const router = useRouter();
  const { courseId, sectionId, lectureId, itemId } = use(params);

  const { data, isLoading } = useLectureItemById(itemId);
  const item = data?.data ?? data;

  const lecturePath = `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`;

  return (
    <div className='max-w-4xl mx-auto space-y-8 py-8'>
      <Header
        title={isLoading ? 'Loading...' : (item?.title || 'Item')}
        description={item?.itemType ?? ''}
        actions={
          <>
            <Button variant='outline' size='sm' onClick={() => router.push(lecturePath)}>
              Back
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
          </>
        }
      />

      <section className='rounded-2xl border bg-card p-6 shadow-sm'>
        <ContentPreview content={item?.contentJson ?? item?.content} itemType={item?.itemType} />
      </section>
    </div>
  );
}
