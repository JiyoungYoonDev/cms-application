'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dropdown } from '@/components/ui/form/Dropdown';
import { Fields } from '@/components/ui/form/Fields';
import { useGenerateCourse } from '../../hooks';
import {
  useCourseCategoriesQuery,
  useCreateCourseCategoryMutation,
} from '../../hooks/use-course-category-mutation';

const INITIAL_FORM = {
  topic: '',
  level: '',
  targetAudience: '',
  numberOfSections: 3,
  tone: '',
  accessPolicy: '',
  categoryId: null,
  extraInstructions: '',
};

export default function CourseGenerateModal({ open, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categoriesData, isLoading: isLoadingCats } =
    useCourseCategoriesQuery();
  const createCategoryMutation = useCreateCourseCategoryMutation();

  const categories = useMemo(
    () =>
      Array.isArray(categoriesData)
        ? categoriesData
        : (categoriesData?.data ?? []),
    [categoriesData],
  );

  const generateMutation = useGenerateCourse({
    onSuccess: (data) => {
      const courseId = data?.data?.courseId;
      onClose();
      setForm(INITIAL_FORM);
      if (courseId) {
        router.push(`/admin/courses/${courseId}`);
      }
    },
    onError: (err) => {
      console.error('[AI Generation Error]', err);
      setError(err?.message || 'Generation failed. Please try again.');
    },
  });

  const handleCategorySubmit = async (e) => {
    e?.preventDefault?.();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      const created = await createCategoryMutation.mutateAsync({
        categoryName: trimmed,
      });
      const createdCategory = created?.data ?? created;
      const createdId = createdCategory?.id ?? createdCategory?.categoryId;
      if (createdId != null) {
        setForm((prev) => ({ ...prev, categoryId: Number(createdId) }));
      }
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const handleSubmit = () => {
    setError(null);

    if (!form.topic.trim()) {
      setError('Topic is required.');
      return;
    }
    if (!form.categoryId) {
      setError('Category is required.');
      return;
    }

    generateMutation.mutate(form);
  };

  if (!open) return null;

  const isLoading = generateMutation.isPending;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className='relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 p-8 rounded-[32px] border bg-card shadow-2xl animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-primary/10'>
              <Sparkles size={20} className='text-primary' />
            </div>
            <div>
              <h2 className='text-lg font-bold'>Generate Course with AI</h2>
              <p className='text-sm text-muted-foreground'>
                Describe your course and AI will create a draft structure.
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

        {/* Form */}
        <div className='space-y-6'>
          <Fields
            items={[
              {
                key: 'topic',
                label: 'Topic *',
                child: (
                  <Input
                    placeholder='e.g. Java Fundamentals, React Hooks, Python Data Structures'
                    className='py-6 text-base'
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
                    disabled={isLoading}
                  />
                ),
              },
              {
                key: 'category',
                label: 'Category *',
                child: (
                  <div className='relative space-y-3'>
                    <Dropdown
                      data={categories}
                      value={
                        form.categoryId != null ? String(form.categoryId) : ''
                      }
                      onChange={(val) => {
                        setIsAddingCategory(false);
                        setForm({ ...form, categoryId: val ? Number(val) : null });
                      }}
                      placeholder={
                        isLoadingCats ? 'Loading...' : 'Select Category'
                      }
                      valueKey='id'
                      labelKey='categoryName'
                      onAddClick={() => setIsAddingCategory(true)}
                      add
                    />

                    {isAddingCategory && (
                      <div className='p-4 rounded-2xl border bg-background shadow-lg animate-in zoom-in-95 duration-200'>
                        <div className='flex items-center justify-between mb-3 px-1'>
                          <span className='text-[10px] font-black uppercase tracking-widest opacity-40'>
                            New Category
                          </span>
                          <X
                            size={14}
                            className='cursor-pointer opacity-30 hover:opacity-100'
                            onClick={() => setIsAddingCategory(false)}
                          />
                        </div>
                        <div className='flex gap-2'>
                          <Input
                            autoFocus
                            placeholder='Category Name'
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCategorySubmit(e)}
                            className='h-9 text-sm'
                            disabled={createCategoryMutation.isPending}
                          />
                          <Button
                            variant='publish'
                            size='icon-sm'
                            onClick={handleCategorySubmit}
                            disabled={createCategoryMutation.isPending}
                          >
                            <Check size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'level',
                label: 'Level',
                child: (
                  <Dropdown
                    data={[
                      { value: 'BEGINNER', label: 'Beginner' },
                      { value: 'INTERMEDIATE', label: 'Intermediate' },
                      { value: 'ADVANCED', label: 'Advanced' },
                      { value: 'PROFESSIONAL', label: 'Professional' },
                      { value: 'EXPERT', label: 'Expert' },
                    ]}
                    value={form.level}
                    onChange={(val) => setForm({ ...form, level: val || '' })}
                    placeholder='Select Level'
                    valueKey='value'
                    labelKey='label'
                  />
                ),
              },
              {
                key: 'targetAudience',
                label: 'Target Audience',
                child: (
                  <Input
                    placeholder='e.g. CS students, self-taught developers, junior engineers'
                    value={form.targetAudience}
                    onChange={(e) =>
                      setForm({ ...form, targetAudience: e.target.value })
                    }
                    disabled={isLoading}
                  />
                ),
              },
            ]}
          />

          {/* Second row */}
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
                Number of Sections
              </label>
              <Input
                type='number'
                min={1}
                max={20}
                className='h-12 font-mono'
                value={form.numberOfSections}
                onChange={(e) =>
                  setForm({
                    ...form,
                    numberOfSections: Math.max(
                      1,
                      Math.min(20, Number(e.target.value)),
                    ),
                  })
                }
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
                Tone / Style
              </label>
              <Dropdown
                data={[
                  { value: 'practical', label: 'Practical' },
                  { value: 'academic', label: 'Academic' },
                  { value: 'casual', label: 'Casual' },
                  { value: 'concise', label: 'Concise' },
                ]}
                value={form.tone}
                onChange={(val) => setForm({ ...form, tone: val || '' })}
                placeholder='Select Tone'
                valueKey='value'
                labelKey='label'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              Access Policy Hint
            </label>
            <Dropdown
              data={[
                { value: 'all-free', label: 'All Free' },
                { value: 'first-section-free', label: 'First Section Free, Rest Premium' },
                { value: 'all-premium', label: 'All Premium' },
              ]}
              value={form.accessPolicy}
              onChange={(val) =>
                setForm({ ...form, accessPolicy: val || '' })
              }
              placeholder='Select Access Policy'
              valueKey='value'
              labelKey='label'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              Extra Instructions (optional)
            </label>
            <Textarea
              placeholder='Any specific requirements, focus areas, or constraints...'
              className='min-h-[80px] resize-none'
              value={form.extraInstructions}
              onChange={(e) =>
                setForm({ ...form, extraInstructions: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className='p-4 rounded-xl bg-destructive/10 text-destructive text-sm'>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t'>
            <Button
              variant='ghost'
              onClick={onClose}
              disabled={isLoading}
            >
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
                  Generate Draft
                </>
              )}
            </Button>
          </div>

          {/* Loading info */}
          {isLoading && (
            <p className='text-xs text-muted-foreground text-center'>
              AI is generating your course structure and content. This may take 2-5 minutes for large topics...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
