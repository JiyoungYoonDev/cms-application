'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fields } from '@/components/ui/form/Fields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { CodingSetFields } from './coding-set-fields';
import { QuizSetFields } from './quiz-set-fields';
import { ProjectFields } from './project-fields';
import { Type, AlignLeft, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useLectureItems,
  useCreateLectureItem,
  useDeleteLectureItem,
  useReorderLectureItems,
} from '@/features/lectures/hooks';

const ITEM_TYPES = [
  'RICH_TEXT',
  'IMAGE',
  'VIDEO',
  'CODE_BLOCK',
  'QUIZ_SET',
  'CODING_SET',
  'PROJECT',
  'CHECKPOINT',
  'TEST_BLOCK',
];

const EMPTY_FORM = {
  title: '',
  itemType: 'RICH_TEXT',
  content: { type: 'doc', content: [] },
};

function ItemForm({ initial = EMPTY_FORM, onSave, onCancel, isPending }) {
  const [values, setValues] = useState(initial);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.title.trim()) {
      window.alert('Title is required.');
      return;
    }
    onSave(values);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border bg-card/50 p-6'>
      <Fields
        items={[
          {
            key: 'title',
            label: (
              <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
                <Type size={11} /> Item Title
              </span>
            ),
            className: 'sm:col-span-2',
            child: (
              <Input
                placeholder='e.g. What is a Variable?'
                value={values.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className='h-11 border-input/60'
              />
            ),
          },
          {
            key: 'itemType',
            label: (
              <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
                Item Type
              </span>
            ),
            child: (
              <Select
                value={values.itemType}
                onValueChange={(val) => handleChange('itemType', val)}
              >
                <SelectTrigger className='border-input/60'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          },
          ...(values.itemType !== 'CODING_SET' && values.itemType !== 'QUIZ_SET' && values.itemType !== 'TEST_BLOCK' && values.itemType !== 'PROJECT' ? [{
            key: 'content',
            label: (
              <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
                <AlignLeft size={11} /> Content
              </span>
            ),
            className: 'sm:col-span-2',
            child: (
              <div className='rounded-2xl border border-input/60 overflow-hidden'>
                <SimpleEditor
                  initialData={values.content}
                  onChange={(json) => handleChange('content', json)}
                />
              </div>
            ),
          }] : []),
        ]}
      />
      {values.itemType === 'CODING_SET' && (
        <CodingSetFields
          value={values.content}
          onChange={(val) => handleChange('content', val)}
        />
      )}
      {(values.itemType === 'QUIZ_SET' || values.itemType === 'TEST_BLOCK') && (
        <QuizSetFields
          value={values.content}
          onChange={(val) => handleChange('content', val)}
        />
      )}
      {values.itemType === 'PROJECT' && (
        <ProjectFields
          value={values.content}
          onChange={(val) => handleChange('content', val)}
        />
      )}
      <div className='flex gap-2 justify-end'>
        <Button type='button' variant='outline' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' size='sm' disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Item'}
        </Button>
      </div>
    </form>
  );
}

function SortableRow({ item, basePath, onDelete, isReordering }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !isReordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className='rounded-xl border bg-card overflow-hidden flex items-center gap-3 px-4 py-3'
    >
      {isReordering && (
        <button
          type='button'
          className='shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none'
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>
      )}

      <div
        className={`flex items-center gap-3 min-w-0 flex-1 ${isReordering ? '' : 'cursor-pointer'}`}
        onClick={() => !isReordering && basePath && router.push(`${basePath}/items/${item.id}`)}
      >
        <span className='text-xs font-medium text-muted-foreground w-6 text-right'>
          {item.sortOrder}
        </span>
        <span className='rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {item.itemType}
        </span>
        <span className='truncate text-sm font-medium'>{item.title}</span>
      </div>

      {!isReordering && (
        <div className='shrink-0'>
          <Button
            variant='destructive'
            size='sm'
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
          >
            Delete
          </Button>
        </div>
      )}
    </li>
  );
}

export function LectureItemsManager({ lectureId, basePath }) {
  const { data, isLoading } = useLectureItems(lectureId);
  const { mutate: createItem, isPending: isCreating, error: createError } = useCreateLectureItem();
  const { mutate: reorderItems, isPending: isReorderSaving } = useReorderLectureItems();
  const { mutate: deleteItem } = useDeleteLectureItem();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);

  const rawItems =
    data?.data?.content ?? data?.data ?? data?.content ?? (Array.isArray(data) ? data : []);

  useEffect(() => {
    if (!isReordering) {
      setOrderedItems(rawItems);
    }
  }, [data, isReordering]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = useCallback(({ active, over }) => {
    if (!over || active.id === over.id) return;
    setOrderedItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleReorderSave = useCallback(() => {
    reorderItems(
      { lectureId, itemIds: orderedItems.map((i) => i.id) },
      { onSuccess: () => setIsReordering(false) },
    );
  }, [lectureId, orderedItems, reorderItems]);

  const handleReorderToggle = () => {
    if (isReordering) {
      setOrderedItems(rawItems);
      setIsReordering(false);
    } else {
      setIsReordering(true);
    }
  };

  const handleCreate = useCallback(
    (values) => {
      createItem(
        { lectureId, payload: values },
        { onSuccess: () => setShowAddForm(false) },
      );
    },
    [lectureId, createItem],
  );

  const handleDelete = useCallback(
    (item) => {
      if (!window.confirm(`Delete "${item.title}"?`)) return;
      deleteItem({ itemId: item.id });
    },
    [deleteItem],
  );

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading items...</p>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <span />
        {orderedItems.length > 0 && (
          <div className='flex gap-2'>
            {isReordering && (
              <Button variant='outline' size='sm' onClick={handleReorderToggle}>
                Cancel
              </Button>
            )}
            <Button
              variant={isReordering ? 'default' : 'outline'}
              size='sm'
              disabled={isReorderSaving}
              onClick={isReordering ? handleReorderSave : handleReorderToggle}
            >
              {isReorderSaving ? 'Saving...' : isReordering ? 'Save' : 'Edit Order'}
            </Button>
          </div>
        )}
      </div>

      {orderedItems.length === 0 && !showAddForm && (
        <p className='text-sm text-muted-foreground'>No items yet. Add one below.</p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={isReordering ? handleDragEnd : undefined}
      >
        <SortableContext
          items={orderedItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className='space-y-3'>
            {orderedItems.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                basePath={isReordering ? null : basePath}
                onDelete={handleDelete}
                isReordering={isReordering}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {!isReordering && (
        showAddForm ? (
          <>
            {createError && (
              <p className='text-sm text-destructive font-medium px-1'>
                Error: {createError.message}
              </p>
            )}
            <ItemForm
              onSave={handleCreate}
              onCancel={() => setShowAddForm(false)}
              isPending={isCreating}
            />
          </>
        ) : (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowAddForm(true)}
          >
            + Add Item
          </Button>
        )
      )}
    </div>
  );
}
