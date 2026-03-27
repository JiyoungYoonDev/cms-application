'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LectureEditorPanel } from '@/components/admin/cms/lecture-editor-panel';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { Header } from '@/components/common/layout/page-header';
import { useCreateLecture, useLectureById, useUpdateLecture } from '@/features/lectures/hooks';

const isNew = (id) => id === 'new';

export default function LectureEditorPage({ params }) {
  const router = useRouter();
  const resolvedParams =
    typeof params?.then === 'function' ? use(params) : params;
  const { sectionId, lectureId } = resolvedParams;

  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    contentJson: { type: 'doc', content: [] },
    sortOrder: 1,
    durationMinutes: 10,
    isPreview: false,
    isPublished: false,
    lectureType: 'TEXT',
  });
  const [draftHydrated, setDraftHydrated] = useState(false);

  const { data: lectureData } = useLectureById(
    !isNew(lectureId) ? sectionId : null,
    !isNew(lectureId) ? lectureId : null,
  );

  useEffect(() => {
    if (!lectureData) return;
    const d = lectureData?.data ?? lectureData;
    setFormValues({
      title: d.title ?? '',
      description: d.description ?? '',
      contentJson: d.contentJson ?? { type: 'doc', content: [] },
      sortOrder: d.sortOrder ?? 1,
      durationMinutes: d.durationMinutes ?? 10,
      isPreview: d.isPreview ?? false,
      isPublished: d.isPublished ?? false,
      lectureType: d.lectureType ?? 'TEXT',
    });
  }, [lectureData]);

  const { mutate: create, isPending: isCreating } = useCreateLecture({
    onSuccess: () => {
      window.sessionStorage.removeItem(`lecture-draft:${lectureId}`);
      router.push(`/admin/sections/${sectionId}/lectures`);
    },
  });

  const { mutate: update, isPending: isUpdating } = useUpdateLecture({
    onSuccess: () => {
      window.sessionStorage.removeItem(`lecture-draft:${lectureId}`);
      router.push(`/admin/sections/${sectionId}/lectures/${lectureId}`);
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
      contentJson: formValues.contentJson,
      sortOrder: formValues.sortOrder,
      durationMinutes: formValues.durationMinutes,
      isPreview: formValues.isPreview,
      isPublished: formValues.isPublished,
      lectureType: formValues.lectureType,
    };

    if (isNew(lectureId)) {
      create({ sectionId, payload });
    } else {
      update({ sectionId, lectureId, payload });
    }
  }, [formValues, sectionId, lectureId, create, update]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(`lecture-draft:${lectureId}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setFormValues((prev) => ({ ...prev, ...parsed }));
    } catch (error) {
      console.error('Failed to load lecture draft:', error);
    } finally {
      setDraftHydrated(true);
    }
  }, [lectureId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(`lecture-draft:${lectureId}`);
    if (raw) return;
    setDraftHydrated(true);
  }, [lectureId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!draftHydrated) return;
    const payload = {
      title: formValues.title,
      description: formValues.description,
      contentJson: formValues.contentJson,
      sortOrder: formValues.sortOrder,
      durationMinutes: formValues.durationMinutes,
      isPreview: formValues.isPreview,
      isPublished: formValues.isPublished,
      lectureType: formValues.lectureType,
    };
    window.sessionStorage.setItem(
      `lecture-draft:${lectureId}`,
      JSON.stringify(payload),
    );
  }, [draftHydrated, formValues, lectureId]);

  const handlePreview = () => {
    if (typeof window !== 'undefined') {
      const payload = {
        title: formValues.title,
        contentJson: formValues.contentJson,
      };
      window.sessionStorage.setItem(
        `lecture-preview:${lectureId}`,
        JSON.stringify(payload),
      );
    }

    router.push(`/admin/sections/${sectionId}/lectures/${lectureId}/preview`);
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
      <div className='space-y-6'>
        <Header
          title={formValues.title || 'New Lecture'}
          description={`Editing lecture in Section #${sectionId}`}
          actions={
            <>
              <Button variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <Button variant='outline' onClick={handlePreview}>
                Preview
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Lecture'}
              </Button>
            </>
          }
        />

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
      </div>

      <aside className='space-y-6'>
        <section className='sticky top-6 rounded-2xl border bg-card p-6 shadow-sm'>
          <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
            Lecture Settings
          </h2>
          <div className='mt-4'>
            <LectureEditorPanel values={formValues} onChange={setFormValues} />
          </div>
        </section>
      </aside>
    </div>
  );
}
