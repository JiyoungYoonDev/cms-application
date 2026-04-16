'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FormPageShell from '@/components/common/forms/form-page-shell';
import CourseBasicInfoFields from './course-basic-info-fields';
import CourseEditorFields from './course-editor-fields';
import CourseSectionFields from '../../../sections/components/form/course-sections-fields';
import { Button } from '@/components/ui/button';
import { Rocket, Save } from 'lucide-react';
import FormSidebar from '@/components/common/forms/form-sidebar';
import { createEmptyCourseForm } from '../../utils/course-form-mappers';
import { useCreateCourse, useUpdateCourse } from '../../hooks';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

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
  const [isDirty, setIsDirty] = useState(false);
  const isInitializingRef = useRef(false);

  const updateCourse = useUpdateCourse();
  const createCourse = useCreateCourse();
  const { confirmLeave } = useUnsavedChanges(isDirty);

  // Edit Mode
  useEffect(() => {
    if (mode === 'edit' && initialCourse) {
      const course = initialCourse?.data ?? initialCourse;

      isInitializingRef.current = true;

      setFormData({
        title: course.title ?? '',
        description: course.description ?? '',
        difficulty: course.difficulty ?? null,
        categoryId: course.categoryId ?? null,
        hours: course.hours ?? 0,
        projects_count: course.projectsCount ?? 0,
        imageUrl: course.imageUrl ?? '',
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

      requestAnimationFrame(() => { isInitializingRef.current = false; });
    }
  }, [mode, initialCourse]);

  const handleFormDataChange = (value) => {
    setFormData(value);
    if (!isInitializingRef.current) setIsDirty(true);
  };

  const handleSectionsChange = (value) => {
    setSections(value);
    if (!isInitializingRef.current) setIsDirty(true);
  };

  const handleEditorContentChange = (value) => {
    setEditorContent(value);
    if (!isInitializingRef.current) setIsDirty(true);
  };

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
    try {
      if (mode === 'edit' && courseId) {
        await updateCourse.mutateAsync({ id: courseId, payload });
      } else {
        await createCourse.mutateAsync(payload);
      }
      setIsDirty(false);
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
            setFormData={handleFormDataChange}
          />

          <CourseEditorFields
            editorContent={editorContent}
            setEditorContent={handleEditorContentChange}
          />

          <CourseSectionFields
            sections={sections}
            setSections={handleSectionsChange}
            title='03. Course Sections'
            description='Manage detailed course sections and assessment structures.'
          />
        </div>
      }
      sidebar={
        <FormSidebar
          onBack={() => { if (confirmLeave()) router.back(); }}
          backLabel='Back to list'
        >
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
        </FormSidebar>
      }
    />
  );
}
