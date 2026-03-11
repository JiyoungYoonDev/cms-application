'use client';

import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Field } from '@/components/ui/field';
import { Dropdown } from '@/components/ui/form/Dropdown';
import { Fields } from '@/components/ui/form/Fields';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useCourseCategoriesQuery,
  useCreateCourseCategoryMutation,
} from '@/hooks/queries';
import { useState } from 'react';

export default function Home() {
  const { data: courseCategoriesData, isLoading: isLoadingCategories } =
    useCourseCategoriesQuery();
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [difficulty, setDifficulty] = useState('');

  const createCourseCategoryMutation = useCreateCourseCategoryMutation();
  const courseCategories = Array.isArray(courseCategoriesData)
    ? courseCategoriesData
    : (courseCategoriesData?.data ??
      courseCategoriesData?.items ??
      courseCategoriesData?.results ??
      []);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    try {
      await createCourseCategoryMutation.mutateAsync({
        category_name: trimmed,
      });
      setCategory(trimmed);
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCategoryCancel = () => {
    setIsAddingCategory(false);
    setNewCategory('');
  };

  const handleNewCategoryChange = (event) => {
    const nextValue = event.target.value;
    setNewCategory(nextValue);
    setCategory(nextValue);
    console.log(nextValue);
  };

  const handleCategoryChange = (nextValue) => {
    setIsAddingCategory(false);
    setNewCategory('');
    setCategory(nextValue);
  };

  const example_difficulty_data = [
    {
      id: 1,
      difficulty: 'Easy',
    },
    {
      id: 2,
      difficulty: 'Medium',
    },
    {
      id: 3,
      difficulty: 'Hard',
    },
  ];
  return (
    <div className=''>
      <div className='flex-col gap-0.5'>
        <Fields
          items={[
            {
              key: 'category',
              label: 'Course Category',
              child: (
                <Dropdown
                  data={courseCategories}
                  value={category}
                  onChange={handleCategoryChange}
                  onAddClick={() => {
                    setIsAddingCategory(true);
                    setCategory('');
                  }}
                  placeholder={
                    isLoadingCategories
                      ? 'Loading categories...'
                      : 'Select category'
                  }
                  label='Course Category'
                  valueKey='categoryName'
                  labelKey='categoryName'
                  add
                />
              ),
            },
            {
              key: 'difficulty',
              label: 'Problem Difficulty',
              child: (
                <Dropdown
                  data={example_difficulty_data}
                  value={difficulty}
                  onChange={setDifficulty}
                  placeholder='Select difficulty'
                  label='Problem Difficulty'
                  valueKey='difficulty'
                  labelKey='difficulty'
                />
              ),
            },
          ]}
        />
      </div>
      {isAddingCategory && (
        <form className='mt-2' onSubmit={handleCategorySubmit}>
          <label htmlFor='new-category'>New Category</label>
          <Input
            id='new-category'
            type='text'
            placeholder='Enter category name'
            value={newCategory}
            onChange={handleNewCategoryChange}
          />
          <Field orientation='horizontal' className='mt-4'>
            <Button
              type='submit'
              disabled={createCourseCategoryMutation.isPending}
            >
              {createCourseCategoryMutation.isPending ? 'Saving...' : 'Submit'}
            </Button>
            <Button
              variant='outline'
              type='button'
              onClick={handleCategoryCancel}
            >
              Cancel
            </Button>
          </Field>
        </form>
      )}
      <div className='mt-4'>
        <SimpleEditor />
      </div>
    </div>
  );
}
