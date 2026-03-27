import { SectionCard } from '@/components/admin/cms/section-card';

export function SectionList({
  sections,
  lecturesBySection,
  onManage,
  onEdit,
  onDelete,
}) {
  return (
    <div className='space-y-4'>
      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          lectureCount={
            section.lecture_count ??
            section.lectureCount ??
            lecturesBySection[section.id]?.length ??
            0
          }
          onManage={() => onManage(section)}
          onEdit={() => onEdit(section)}
          onDelete={() => onDelete(section)}
        />
      ))}
    </div>
  );
}
