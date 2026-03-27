'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormPageShell from '@/components/common/forms/form-page-shell';
import CourseBasicInfoFields from './course-basic-info-fields';
import CourseEditorFields from './course-editor-fields';
import CourseSectionFields from '../../../sections/components/form/course-sections-fields';
import { Button } from '@/components/ui/button';
import { Rocket, Save, ChevronLeft } from 'lucide-react';
import { createEmptyCourseForm } from '../../utils/course-form-mappers';
import { useCreateCourse, useUpdateCourse } from '../../hooks';

export default function CourseForm({
  mode = 'create',
  courseId,
  initialCourse,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(createEmptyCourseForm());
  const [sections, setSections] = useState([]);
  const [editorContent, setEditorContent] = useState(undefined);

  const updateCourse = useUpdateCourse();
  const createCourse = useCreateCourse();

  // Edit Mode
  useEffect(() => {
    if (mode === 'edit' && initialCourse) {
      const course = initialCourse?.data ?? initialCourse;

      setFormData({
        title: course.title ?? '',
        description: course.description ?? '',
        difficulty: course.difficulty ?? null,
        categoryId: course.categoryId ?? null,
        hours: course.hours ?? 0,
        projects_count: course.projectsCount ?? 0,
        status: course.status ?? '',
      });

      setSections(course.sections ?? []);

      const curriculum =
        course.detailedCurriculum ??
        course.detailed_curriculum ??
        course.detailedCurriculumJson ??
        course.detailed_curriculum_json ??
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
    }
  }, [mode, initialCourse]);

  const handleSubmit = async (status) => {
    if (!formData.difficulty) {
      alert('Please select difficulty');
      return;
    }
    if (!formData.categoryId) {
      alert('Please select category');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      categoryId: formData.categoryId,
      difficulty: formData.difficulty || null,
      course_sections: sections,
      detailedCurriculum: editorContent != null ? JSON.stringify(editorContent) : null,
      status,
      sections,
    };
    console.log('PAYLOAD ', payload);
    try {
      if (mode === 'edit' && courseId) {
        console.log('Course ID ', courseId);
        await updateCourse.mutateAsync({ id: courseId, payload });
      } else {
        await createCourse.mutateAsync(payload);
      }
      router.push('/admin/courses');
    } catch (error) {
      console.error('Submit Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPageShell
      main={
        <div className='space-y-12'>
          <CourseBasicInfoFields
            formData={formData}
            setFormData={setFormData}
          />

          <CourseEditorFields
            editorContent={editorContent}
            setEditorContent={setEditorContent}
          />

          <CourseSectionFields
            sections={sections}
            setSections={setSections}
            title='03. Course Sections'
            description='Manage detailed course sections and assessment structures.'
          />
        </div>
      }
      sidebar={
        <div className='sticky top-10 space-y-6'>
          <div className='p-8 border rounded-[32px] bg-card shadow-sm space-y-8'>
            <div className='space-y-2'>
              <h3 className='text-xs font-black uppercase tracking-widest opacity-40'>
                Actions
              </h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Please verify your updates before publishing.
              </p>
            </div>

            <div className='flex flex-col gap-3'>
              <Button
                variant='publish'
                size='lg'
                onClick={() => handleSubmit('PUBLISHED')}
                disabled={loading}
              >
                <Rocket size={18} className='mr-2' />
                {loading ? 'Processing...' : 'Publish Course'}
              </Button>

              <Button
                variant='outline'
                size='lg'
                className='rounded-xl font-bold border-input'
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
              >
                <Save size={18} className='mr-2' />
                Save as Draft
              </Button>
            </div>

            <div className='pt-4 border-t'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start text-muted-foreground'
                onClick={() => router.back()}
              >
                <ChevronLeft size={16} className='mr-1' /> Back to list
              </Button>
            </div>
          </div>
        </div>
      }
    />
  );
}
