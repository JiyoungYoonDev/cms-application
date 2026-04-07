import { useState } from 'react';
import { createEmptySectionForm } from '../../utils/section-form-mapper';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Header } from '@/components/common/layout/page-header';
import CourseSectionForm from './section-form';
import CourseSectionCard from './section-item';

export default function CourseSectionFields({
  sections,
  setSections,
  title,
  description,
  className,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempSection, setTempSection] = useState(createEmptySectionForm());

  const resetTemp = () => setTempSection(createEmptySectionForm());

  const startAdd = () => {
    resetTemp();
    setEditingId(null);
    setIsAdding(true);
  };

  const onSave = () => {
    if (!tempSection.title) return;
    if (editingId) {
      setSections(
        sections.map((s) => (s.id === editingId ? { ...tempSection } : s)),
      );
      setEditingId(null);
    } else {
      const nextId =
        sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;
      setSections([...sections, { ...tempSection, id: nextId }]);
      setIsAdding(false);
    }
    resetTemp();
  };

  const onCancel = (id) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const onEdit = (section) => {
    setTempSection(section);
    setIsAdding(false);
    setEditingId(section.id);
  };

  return (
    <section className={`space-y-6 ${className}`}>
      <div className='flex items-center justify-between ml-4 mr-2'>
        <Header variant='section' title={title} description={description} />
        {!isAdding && !editingId && (
          <Button
            onClick={startAdd}
            variant='outline'
            size='sm'
            className='rounded-xl border-slate-800 text-slate-400 gap-2'
          >
            <Plus size={16} /> Add Section
          </Button>
        )}
      </div>
      <div className='space-y-3'>
        {isAdding && (
          <CourseSectionForm
            sections={tempSection}
            setSections={setTempSection}
            onSave={onSave}
            onCancel={onCancel}
            isNew={true}
          />
        )}
      </div>

      {sections.map((section, idx) =>
        editingId === section.id ? (
          <CourseSectionForm
            key={section.id}
            sections={tempSection}
            setSections={setTempSection}
            onSave={onSave}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <CourseSectionCard
            idx={idx}
            section={section}
            onEdit={onEdit}
            key={section.id}
            onCancel={onCancel}
          />
        ),
      )}
    </section>
  );
}
