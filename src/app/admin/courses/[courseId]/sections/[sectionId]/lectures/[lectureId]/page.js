'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/layout/page-header';
import { LectureItemsManager } from '@/features/lectures/components/items/lecture-items-manager';
import { useLectureById } from '@/features/lectures/hooks';
import { useSectionById } from '@/features/sections/hooks/use-section';
import { regenerateLecture, reconvertLecture } from '@/features/courses/services/generation-service';
import { RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import ItemGenerateModal from '@/features/courses/components/generate/item-generate-modal';

export default function LectureManagePage({ params }) {
  const router = useRouter();
  const { courseId, sectionId, lectureId } = use(params);
  const [regenerating, setRegenerating] = useState(false);
  const [reconverting, setReconverting] = useState(false);
  const [regenResult, setRegenResult] = useState(null);
  const [showItemGenModal, setShowItemGenModal] = useState(false);

  const { data: lectureData, isLoading } = useLectureById(sectionId, lectureId);
  const { data: sectionData } = useSectionById(courseId, sectionId);

  const lectureName = lectureData?.data?.title ?? lectureData?.title;
  const sectionName = sectionData?.data?.title ?? sectionData?.title ?? `Section #${sectionId}`;

  async function handleRegenerate() {
    if (regenerating) return;
    if (!window.confirm(`"${lectureName}" 의 콘텐츠를 다시 생성하시겠습니까?`)) return;
    setRegenerating(true);
    setRegenResult(null);
    try {
      await regenerateLecture(lectureId);
      setRegenResult({ success: true, message: 'Content regenerated successfully. Refresh to see updates.' });
    } catch (e) {
      setRegenResult({ success: false, message: e?.message || 'Regeneration failed.' });
    } finally {
      setRegenerating(false);
    }
  }

  async function handleReconvert() {
    if (reconverting) return;
    if (!window.confirm(`"${lectureName}" 의 콘텐츠를 재변환하시겠습니까? (AI 재호출 없이 기존 출력을 다시 파싱합니다)`)) return;
    setReconverting(true);
    setRegenResult(null);
    try {
      const res = await reconvertLecture(lectureId);
      const count = res?.data?.reconvertedItems ?? 0;
      setRegenResult({ success: true, message: `${count}개 아이템 재변환 완료. 새로고침하면 반영됩니다.` });
    } catch (e) {
      setRegenResult({ success: false, message: e?.message || 'Reconvert failed.' });
    } finally {
      setReconverting(false);
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8 py-8'>
      <ItemGenerateModal
        open={showItemGenModal}
        onClose={() => setShowItemGenModal(false)}
        lectureId={lectureId}
      />
      <Header
        title={isLoading ? 'Loading...' : (lectureName || 'Lecture')}
        description={sectionName}
        actions={
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => router.back()}>
              Back
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setShowItemGenModal(true)}
              className='gap-1.5'
            >
              <Sparkles size={14} />
              AI Add Item
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={handleReconvert}
              disabled={reconverting}
              className='gap-1.5'
            >
              <RotateCcw size={14} className={reconverting ? 'animate-spin' : ''} />
              {reconverting ? 'Reconverting...' : 'Reconvert'}
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={handleRegenerate}
              disabled={regenerating}
              className='gap-1.5'
            >
              <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Generating...' : 'Regenerate Content'}
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
        <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4'>
          Lecture Items
        </h2>
        <LectureItemsManager
          lectureId={lectureId}
          basePath={`/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`}
        />
      </section>
    </div>
  );
}
