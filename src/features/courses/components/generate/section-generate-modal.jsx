'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateSection } from '../../hooks/use-generate-section';

const INITIAL_FORM = {
  sectionTopic: '',
  numberOfLectures: 3,
  extraInstructions: '',
};

export default function SectionGenerateModal({ open, onClose, courseId }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);

  const mutation = useGenerateSection({
    onSuccess: () => {
      onClose();
      setForm(INITIAL_FORM);
    },
    onError: (err) => {
      setError(err?.message || 'Section generation failed. Please try again.');
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!form.sectionTopic.trim()) {
      setError('Section topic is required.');
      return;
    }
    mutation.mutate({ courseId: Number(courseId), ...form });
  };

  if (!open) return null;

  const isLoading = mutation.isPending;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={!isLoading ? onClose : undefined}
      />

      <div className='relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 p-8 rounded-[32px] border bg-card shadow-2xl animate-in zoom-in-95 duration-200'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-primary/10'>
              <Sparkles size={20} className='text-primary' />
            </div>
            <div>
              <h2 className='text-lg font-bold'>AI Add Section</h2>
              <p className='text-sm text-muted-foreground'>
                Describe the section topic and AI will generate lectures &amp; items.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='p-2 rounded-xl hover:bg-muted transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        <div className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              Section Topic *
            </label>
            <Input
              placeholder='e.g. Advanced React Patterns, Binary Trees, Calculus Integration'
              className='py-6 text-base'
              value={form.sectionTopic}
              onChange={(e) => setForm({ ...form, sectionTopic: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              Number of Lectures
            </label>
            <Input
              type='number'
              min={1}
              max={10}
              className='h-12 font-mono'
              value={form.numberOfLectures}
              onChange={(e) =>
                setForm({
                  ...form,
                  numberOfLectures: Math.max(1, Math.min(10, Number(e.target.value))),
                })
              }
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              Extra Instructions (optional)
            </label>
            <Textarea
              placeholder='Any specific requirements or focus areas...'
              className='min-h-[80px] resize-none'
              value={form.extraInstructions}
              onChange={(e) => setForm({ ...form, extraInstructions: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className='p-4 rounded-xl bg-destructive/10 text-destructive text-sm'>
              {error}
            </div>
          )}

          <div className='flex items-center justify-end gap-3 pt-4 border-t'>
            <Button variant='ghost' onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant='publish'
              size='lg'
              onClick={handleSubmit}
              disabled={isLoading}
              className='min-w-[180px]'
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className='mr-2 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} className='mr-2' />
                  Generate Section
                </>
              )}
            </Button>
          </div>

          {isLoading && (
            <p className='text-xs text-muted-foreground text-center'>
              AI is generating the section structure and content. This may take 1-3 minutes...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
