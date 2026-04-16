'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LectureEditorPanel } from './lecture-editor-panel';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { Header } from '@/components/common/layout/page-header';
import FormPageShell from '@/components/common/forms/form-page-shell';
import FormSidebar from '@/components/common/forms/form-sidebar';
import {
  useCreateLecture,
  useLectureById,
  useUpdateLecture,
} from '@/features/lectures/hooks';

const isNew = (id) => id === 'new';

const DEFAULT_FORM = {
  title: '',
  description: '',
  contentJson: { type: 'doc', content: [] },
  durationMinutes: 10,
  isPreview: false,
  isPublished: false,
  lectureType: 'TEXT',
};

/**
 * Lecture editor shell — feature-level component that owns all editing logic.
 * Route files should stay thin wrappers that pass sectionId/lectureId/basePath.
 *
 * Navigation contract (preserved from prior behavior):
 *  - on create  → router.push(basePath)                   (back to list)
 *  - on update  → router.push(`${basePath}/${lectureId}`) (lecture detail)
 */
export function LectureEditorShell({ sectionId, lectureId, basePath }) {
  const router = useRouter();

  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const { data: lectureData } = useLectureById(
    !isNew(lectureId) ? sectionId : null,
    !isNew(lectureId) ? lectureId : null,
  );

  useEffect(() => {
    if (!lectureData) return;
    const d = lectureData?.data ?? lectureData;

    let parsedContent = { type: 'doc', content: [] };
    if (typeof d.contentJson === 'string') {
      try { parsedContent = JSON.parse(d.contentJson); } catch { /* keep default */ }
    } else if (d.contentJson) {
      parsedContent = d.contentJson;
    }

    setFormValues({
      title: d.title ?? '',
      description: d.description ?? '',
      contentJson: parsedContent,
      durationMinutes: d.durationMinutes ?? 10,
      isPreview: d.isPreview ?? false,
      isPublished: d.isPublished ?? false,
      lectureType: d.lectureType ?? 'TEXT',
    });
  }, [lectureData]);

  const { mutate: create, isPending: isCreating } = useCreateLecture({
    onSuccess: () => {
      window.sessionStorage.removeItem(`lecture-draft:${lectureId}`);
      router.push(basePath);
    },
  });

  const { mutate: update, isPending: isUpdating } = useUpdateLecture({
    onSuccess: () => {
      window.sessionStorage.removeItem(`lecture-draft:${lectureId}`);
      router.push(`${basePath}/${lectureId}`);
    },
  });

  const isSaving = isCreating || isUpdating;

  const handleSave = useCallback(() => {
    if (!formValues.title.trim()) {
      window.alert('Lecture title is required.');
      return;
    }

    const payload = {
      title: formValues.title,
      description: formValues.description,
      contentJson: typeof formValues.contentJson === 'string'
        ? formValues.contentJson
        : JSON.stringify(formValues.contentJson),
      durationMinutes: formValues.durationMinutes,
      isPreview: formValues.isPreview,
      isPublished: formValues.isPublished,
      lectureType: formValues.lectureType,
    };

    if (isNew(lectureId)) {
      create({ sectionId, payload: { ...payload, sortOrder: 0 } });
    } else {
      update({ sectionId, lectureId, payload });
    }
  }, [formValues, sectionId, lectureId, create, update]);

  // Draft hydration — load any persisted sessionStorage draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(`lecture-draft:${lectureId}`);
    if (!raw) {
      setDraftHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setFormValues((prev) => ({ ...prev, ...parsed }));
    } catch (error) {
      console.error('Failed to load lecture draft:', error);
    } finally {
      setDraftHydrated(true);
    }
  }, [lectureId]);

  // Draft persistence — save form values to sessionStorage after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!draftHydrated) return;
    const draftPayload = {
      title: formValues.title,
      description: formValues.description,
      contentJson: formValues.contentJson,
      durationMinutes: formValues.durationMinutes,
      isPreview: formValues.isPreview,
      isPublished: formValues.isPublished,
      lectureType: formValues.lectureType,
    };
    window.sessionStorage.setItem(
      `lecture-draft:${lectureId}`,
      JSON.stringify(draftPayload),
    );
  }, [draftHydrated, formValues, lectureId]);

  return (
    <div className='space-y-6'>
      <Header
        title={formValues.title || 'New Lecture'}
        description={`Editing lecture in Section #${sectionId}`}
      />

      <FormPageShell
        main={
          <section className='rounded-2xl border bg-card p-6 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
              Lecture Content
            </h2>
            <div className='mt-4 rounded-2xl border'>
              <SimpleEditor
                initialData={formValues.contentJson}
                onChange={(json) =>
                  setFormValues({ ...formValues, contentJson: json })
                }
              />
            </div>
          </section>
        }
        sidebar={
          <>
            <FormSidebar
              description='Save or discard your lecture changes.'
              onBack={() => router.back()}
            >
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Lecture'}
              </Button>
            </FormSidebar>

            <section className='rounded-2xl border bg-card p-6 shadow-sm'>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
                Lecture Settings
              </h2>
              <div className='mt-4'>
                <LectureEditorPanel values={formValues} onChange={setFormValues} />
              </div>
            </section>
          </>
        }
      />
    </div>
  );
}
