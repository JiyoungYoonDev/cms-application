'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/providers/confirm-dialog-provider';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/layout/page-header';
import { useLectureItemById } from '@/features/lectures/hooks';
import { ItemPreviewModal } from '@/features/lectures/components/items/item-preview-modal';
import { ItemContentRenderer } from '@/features/lectures/components/items/preview/item-content-renderer';
import { regenerateItem } from '@/features/courses/services/generation-service';
import { ScopedValidationPanel } from '@/features/generation/components/scoped-validation-panel';

export default function LectureItemDetailPage({ params }) {
  const router = useRouter();
  const confirm = useConfirm();
  const { courseId, sectionId, lectureId, itemId } = use(params);
  const [regenerating, setRegenerating] = useState(false);
  const [regenResult, setRegenResult] = useState(null);

  const { data, isLoading, refetch } = useLectureItemById(itemId);
  const item = data?.data ?? data;

  const lecturePath = `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`;

  async function handleRegenerate() {
    if (regenerating) return;
    const ok = await confirm({
      title: `Regenerate "${item?.title}"?`,
      description: 'This will call AI again to regenerate content for this item.',
      confirmLabel: 'Regenerate',
    });
    if (!ok) return;
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

      {/* Content preview — unified dark-theme renderer (admin inspect mode: answers revealed) */}
      <section className='rounded-2xl overflow-hidden border border-[#2a2a3e]' style={{ background: '#0d0d1a' }}>
        <div className='px-8 py-10'>
          {isLoading ? (
            <p className='text-sm text-[#5a5a72]'>Loading...</p>
          ) : (
            <ItemContentRenderer item={item} showSolutions />
          )}
        </div>
      </section>

      <section className='rounded-2xl border bg-card p-6 shadow-sm'>
        <ScopedValidationPanel scopeType='ITEM' targetId={itemId} />
      </section>
    </div>
  );
}
