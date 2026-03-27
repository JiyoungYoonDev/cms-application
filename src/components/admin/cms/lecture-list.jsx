import { LectureRow } from '@/components/admin/cms/lecture-row';

export function LectureList({ lectures, onEdit, onDelete, onPreview }) {
  return (
    <div className='space-y-3'>
      {lectures.map((lecture) => (
        <LectureRow
          key={lecture.id}
          lecture={lecture}
          onPreview={() => onPreview(lecture)}
          onEdit={() => onEdit(lecture)}
          onDelete={() => onDelete(lecture)}
        />
      ))}
    </div>
  );
}
