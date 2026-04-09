'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dropdown } from '@/components/ui/form/Dropdown';
import { useGenerateItem } from '../../hooks/use-generate-item';

const ITEM_TYPES = [
  { value: '', label: 'Auto (AI decides)' },
  { value: 'RICH_TEXT', label: 'Rich Text' },
  { value: 'QUIZ_SET', label: 'Quiz Set' },
  { value: 'CODING_SET', label: 'Coding Set' },
  { value: 'CHECKPOINT', label: 'Checkpoint' },
];

const INITIAL_FORM = {
  itemTopic: '',
  itemType: '',
  extraInstructions: '',
};

export default function ItemGenerateModal({ open, onClose, lectureId }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);

  const mutation = useGenerateItem({
    onSuccess: () => {
      onClose();
      setForm(INITIAL_FORM);
    },
    onError: (err) => {
      setError(err?.message || 'Item generation failed. Please try again.');
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!form.itemTopic.trim()) {
      setError('Item topic is required.');
      return;
    }
    mutation.mutate({
      lectureId: Number(lectureId),
      itemTopic: form.itemTopic,
      itemType: form.itemType || null,
      extraInstructions: form.extraInstructions || null,
    });
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
              <h2 className='text-lg font-bold'>AI Add Item</h2>
              <p className='text-sm text-muted-foreground'>
                Describe the item and AI will generate structure + content.
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
              Item Topic *
            </label>
            <Input
              placeholder='e.g. Practice Problems for Sorting, Quick Recap Quiz'
              className='py-6 text-base'
              value={form.itemTopic}
              onChange={(e) => setForm({ ...form, itemTopic: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              Item Type
            </label>
            <Dropdown
              data={ITEM_TYPES}
              value={form.itemType}
              onChange={(val) => setForm({ ...form, itemType: val || '' })}
              placeholder='Auto (AI decides)'
              valueKey='value'
              labelKey='label'
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
                  Generate Item
                </>
              )}
            </Button>
          </div>

          {isLoading && (
            <p className='text-xs text-muted-foreground text-center'>
              AI is generating the item structure and content. This may take 1-2 minutes...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
