import { Header } from '@/components/common/layout/page-header';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';

export default function CourseEditorFields({
  editorContent,
  setEditorContent,
}) {
  return (
    <div>
      <Header variant='section' title='2. Detailed Curriculum' />
      <div className='overflow-hidden bg-card mt-4'>
        <SimpleEditor
          initialData={editorContent}
          onChange={(json) => setEditorContent(json)}
        />
      </div>
    </div>
  );
}
