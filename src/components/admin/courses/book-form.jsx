'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { Dropdown } from '@/components/ui/form/Dropdown';
import { Fields } from '@/components/ui/form/Fields';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  useCourseCategoriesQuery,
  useCreateCourseCategoryMutation,
  useCreateProblemBookMutation,
  useUpdateProblemBookMutation,
} from '@/hooks/queries';
import {
  BookPlus,
  Save,
  Rocket,
  LayoutGrid,
  Info,
  Check,
  X,
} from 'lucide-react';

const createEmptyForm = () => ({
  title: '',
  book_description: '',
  course_category: '',
  book_difficulty: '',
  rating: 0,
  projects_count: 0,
  hours: 0,
  learners_count: 0,
  badge_type: 'New',
  provider: 'Codehaja',
  image_url: '',
});

const normalizeSections = (sections) =>
  (sections ?? []).map((section) => ({
    id: section.id,
    title: section.title ?? '',
    description: section.description ?? '',
    subCount:
      section.subCount ??
      section.sub_count ??
      section.lecture_count ??
      section.lectureCount ??
      0,
    hours: section.hours ?? 0,
    points: section.points ?? 0,
  }));

const normalizeBookToForm = (book) => ({
  title: book.problem_title ?? book.title ?? '',
  book_description: book.book_description ?? book.shortDescription ?? '',
  course_category:
    book.course_category?.category_name ??
    book.course_category ??
    book.category ??
    '',
  book_difficulty: book.book_difficulty ?? book.difficulty ?? '',
  rating: book.rating ?? 0,
  projects_count: book.projects_count ?? book.book_projects_count ?? 0,
  hours: book.hours ?? 0,
  learners_count: book.learners_count ?? 0,
  badge_type: book.badge_type ?? 'New',
  provider: book.provider ?? 'Codehaja',
  image_url: book.image_url ?? '',
});

export default function BookForm({ mode = 'create', bookId, initialBook }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courseSections, setCourseSections] = useState([]);
  const [editorContent, setEditorContent] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState(createEmptyForm());

  const { data: categoriesData, isLoading: isLoadingCats } =
    useCourseCategoriesQuery();
  const createBookMutation = useCreateProblemBookMutation();
  const updateBookMutation = useUpdateProblemBookMutation();
  const createCategoryMutation = useCreateCourseCategoryMutation();

  const categories = useMemo(
    () =>
      Array.isArray(categoriesData)
        ? categoriesData
        : (categoriesData?.data ?? []),
    [categoriesData],
  );

  useEffect(() => {
    if (!initialBook) return;
    setFormData(normalizeBookToForm(initialBook));
    setCourseSections(
      normalizeSections(
        initialBook.course_sections ?? initialBook.courseSections ?? [],
      ),
    );
    const curriculum =
      initialBook.detailedCurriculum ??
      initialBook.detailed_curriculum ??
      initialBook.detailedCurriculumJson ??
      initialBook.detailed_curriculum_json ??
      null;

    if (typeof curriculum === 'string') {
      try {
        setEditorContent(JSON.parse(curriculum));
      } catch {
        setEditorContent(undefined);
      }
    } else if (curriculum) {
      setEditorContent(curriculum);
    } else {
      setEditorContent(undefined);
    }
  }, [initialBook]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      await createCategoryMutation.mutateAsync({ category_name: trimmed });
      setFormData({ ...formData, course_category: trimmed });
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (status) => {
    setLoading(true);
    const payload = {
      ...formData,
      course_sections: courseSections,
      detailedCurriculum: editorContent,
      status,
    };
    try {
      if (mode === 'edit' && bookId) {
        await updateBookMutation.mutateAsync({ bookId, payload });
      } else {
        await createBookMutation.mutateAsync(payload);
      }
      router.push('/admin/courses');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen p-6 md:p-10 transition-colors'>
      <div className='max-w-7xl mx-auto'>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12'>

          <aside className='lg:col-span-4 space-y-6'>
            <div className='border p-8 rounded-[32px] sticky top-10 bg-card shadow-sm'>
              <h3 className='text-xs font-black uppercase tracking-widest mb-10 border-b pb-4 opacity-50'>
                Configurations
              </h3>

              <div className='space-y-8'>
                <Fields
                  items={[
                    {
                      key: 'category',
                      label: 'Category',
                      child: (
                        <div className='space-y-3'>
                          <Dropdown
                            data={categories}
                            value={formData.course_category}
                            onAddClick={() => setIsAddingCategory(true)}
                            onChange={(val) => {
                              setIsAddingCategory(false);
                              setFormData({
                                ...formData,
                                course_category: val,
                              });
                            }}
                            placeholder={
                              isLoadingCats ? 'Loading...' : 'Select Category'
                            }
                            valueKey='categoryName'
                            labelKey='categoryName'
                            add
                          />
                          {isAddingCategory && (
                            <div className='p-4 rounded-xl border animate-in fade-in duration-300'>
                              <label className='text-[10px] font-black uppercase mb-2 block opacity-50'>
                                New Category
                              </label>
                              <div className='flex gap-2'>
                                <Input
                                  autoFocus
                                  placeholder='Name'
                                  value={newCategoryName}
                                  onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                  }
                                />
                                <Button
                                  size='sm'
                                  onClick={handleCategorySubmit}
                                >
                                  <Check size={16} />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => setIsAddingCategory(false)}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'difficulty',
                      label: 'Difficulty',
                      child: (
                        <Dropdown
                          data={[{ v: 'Easy' }, { v: 'Medium' }, { v: 'Hard' }]}
                          value={formData.book_difficulty}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              book_difficulty: val,
                            })
                          }
                          valueKey='v'
                          labelKey='v'
                        />
                      ),
                    },
                  ]}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black uppercase opacity-50'>
                      Hours
                    </label>
                    <Input
                      type='number'
                      placeholder='40'
                      value={formData.hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hours: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black uppercase opacity-50'>
                      Projects
                    </label>
                    <Input
                      type='number'
                      placeholder='5'
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

                <div className='flex flex-col gap-3 pt-8 border-t mt-4'>
                  <Button
                    onClick={() => handleSubmit('PUBLISHED')}
                    disabled={loading}
                    className='w-full py-8 font-black text-lg'
                  >
                    <Rocket size={20} className='mr-2' /> Publish Course
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => handleSubmit('DRAFT')}
                    disabled={loading}
                    className='w-full py-8 font-bold'
                  >
                    <Save size={20} className='mr-2' /> Save as Draft
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
