'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/common/layout/page-header';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/form/Dropdown';
import { Fields } from '@/components/ui/form/Fields';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Clock, Hash, ImageIcon } from 'lucide-react';
import {
  useCourseCategoriesQuery,
  useCreateCourseCategoryMutation,
} from '../../hooks/use-course-category-mutation';

export default function CourseBasicInfoFields({ formData, setFormData }) {
  const { data: categoriesData, isLoading: isLoadingCats } =
    useCourseCategoriesQuery();
  const createCategoryMutation = useCreateCourseCategoryMutation();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const categories = useMemo(
    () =>
      Array.isArray(categoriesData)
        ? categoriesData
        : (categoriesData?.data ?? []),
    [categoriesData],
  );

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      const created = await createCategoryMutation.mutateAsync({
        categoryName: trimmed,
      });
      const createdCategory = created?.data ?? created;
      const createdId = createdCategory?.id ?? createdCategory?.categoryId;
      if (createdId != null) {
        setFormData((prev) => ({
          ...prev,
          categoryId: Number(createdId),
        }));
      }
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className='space-y-8 animate-in fade-in duration-500'>
      {/* 1. Header Section */}
      <div className='px-1'>
        <Header
          variant='section'
          title='01. Essential Information'
          description='Please provide a concise title and a brief summary of your course.'
          className='opacity-90'
        />
      </div>

      {/* 2. Main Content Card */}
      <div className='p-8 rounded-[32px] border bg-card/50 backdrop-blur-sm shadow-sm space-y-8'>
        <Fields
          items={[
            {
              key: 'title',
              label: 'Course Title',
              child: (
                <Input
                  placeholder='ex: Java Masterclass'
                  className='py-7 border-input/60 text-lg font-medium focus:ring-1 focus:ring-foreground/20 transition-all'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              ),
            },
            {
              key: 'description',
              label: 'Description',
              child: (
                <Textarea
                  placeholder='Briefly summarize what this course teaches.'
                  className='min-h-[120px] border-input/60 resize-none leading-relaxed'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              ),
            },
            {
              key: 'difficulty',
              label: 'Difficulty',
              child: (
                <Dropdown
                  data={[
                    { value: 'BEGINNER', label: 'Beginner' },
                    { value: 'INTERMEDIATE', label: 'Intermediate' },
                    { value: 'ADVANCED', label: 'Advanced' },
                    { value: 'PROFESSIONAL', label: 'Professional' },
                    { value: 'EXPERT', label: 'Expert' },
                  ]}
                  value={formData.difficulty ?? ''}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      difficulty: val || null,
                    })
                  }
                  valueKey='value'
                  labelKey='label'
                />
              ),
            },
            {
              key: 'category',
              label: 'Category',
              child: (
                <div className='relative space-y-3'>
                  <Dropdown
                    data={categories}
                    value={
                      formData.categoryId != null
                        ? String(formData.categoryId)
                        : ''
                    }
                    onChange={(val) => {
                      setIsAddingCategory(false);
                      setFormData({
                        ...formData,
                        categoryId: val ? Number(val) : null,
                      });
                    }}
                    placeholder={
                      isLoadingCats ? 'Loading...' : 'Select Category'
                    }
                    valueKey='id'
                    labelKey='categoryName'
                    onAddClick={() => setIsAddingCategory(true)}
                    add
                  />

                  {/* Category Addition Popover-style UI */}
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
                          className='h-9 text-sm'
                        />
                        <Button
                          variant='publish'
                          size='icon-sm'
                          onClick={handleCategorySubmit}
                        >
                          <Check size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />

        {/* 3. Thumbnail URL */}
        <div className='pt-4 border-t border-dashed space-y-3'>
          <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
            <ImageIcon size={12} /> Thumbnail URL
          </label>
          <Input
            placeholder='https://example.com/thumbnail.jpg'
            className='h-12 border-input/60'
            value={formData.imageUrl ?? ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          {formData.imageUrl && (
            <div className='relative w-full aspect-video rounded-2xl overflow-hidden border border-input/40 bg-muted'>
              <img
                src={formData.imageUrl}
                alt='Thumbnail preview'
                className='w-full h-full object-cover'
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* 4. Metrics Grid (Hours & Projects) */}
        <div className='grid grid-cols-2 gap-6 pt-4 border-t border-dashed'>
          <div className='space-y-3'>
            <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              <Clock size={12} /> Hours
            </label>
            <Input
              type='number'
              placeholder='40'
              className='h-12 border-input/60 font-mono'
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: Number(e.target.value) })
              }
            />
          </div>
          <div className='space-y-3'>
            <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              <Hash size={12} /> Projects
            </label>
            <Input
              type='number'
              placeholder='5'
              className='h-12 border-input/60 font-mono'
              value={formData.projects_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  projects_count: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
