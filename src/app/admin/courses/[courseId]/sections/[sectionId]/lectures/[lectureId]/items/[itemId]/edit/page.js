'use client';

import { use, useState } from 'react';
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
import { CodingSetFields } from '@/features/lectures/components/items/coding-set-fields';
import { QuizSetFields } from '@/features/lectures/components/items/quiz-set-fields';
import { Header } from '@/components/common/layout/page-header';
import { Hash, Type, AlignLeft } from 'lucide-react';
import { useLectureItemById, useUpdateLectureItem } from '@/features/lectures/hooks';

const ITEM_TYPES = [
  'RICH_TEXT',
  'IMAGE',
  'VIDEO',
  'CODE_BLOCK',
  'QUIZ_SET',
  'CODING_SET',
  'PROJECT_TASK',
  'CHECKPOINT',
  'TEST_BLOCK',
];

function parseContent(raw) {
  if (!raw) return { type: 'doc', content: [] };
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return { type: 'doc', content: [] };
  }
}

function ItemEditForm({ initial, onSave, onCancel, isPending }) {
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
          {
            key: 'sortOrder',
            label: (
              <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
                <Hash size={11} /> Sort Order
              </span>
            ),
            child: (
              <Input
                type='number'
                placeholder='e.g. 1'
                value={values.sortOrder}
                onChange={(e) => handleChange('sortOrder', Number(e.target.value))}
                className='h-11 border-input/60 font-mono'
              />
            ),
          },
          ...(values.itemType !== 'CODING_SET' && values.itemType !== 'QUIZ_SET' ? [{
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
      {values.itemType === 'QUIZ_SET' && (
        <QuizSetFields
          value={values.content}
          onChange={(val) => handleChange('content', val)}
        />
      )}
      <div className='flex gap-2 justify-end'>
        <Button type='button' variant='outline' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' size='sm' disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export default function LectureItemEditPage({ params }) {
  const router = useRouter();
  const { courseId, sectionId, lectureId, itemId } = use(params);

  const { data, isLoading } = useLectureItemById(itemId);
  const { mutate: updateItem, isPending } = useUpdateLectureItem();

  const item = data?.data ?? data;
  const detailPath = `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/items/${itemId}`;

  const handleSave = (values) => {
    updateItem(
      { itemId, payload: values },
      { onSuccess: () => router.push(detailPath) },
    );
  };

  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto py-8'>
        <p className='text-sm text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8 py-8'>
      <Header
        title='Edit Item'
        description={item?.title ?? ''}
        actions={
          <Button variant='outline' size='sm' onClick={() => router.push(detailPath)}>
            Cancel
          </Button>
        }
      />

      {item && (
        <ItemEditForm
          key={itemId}
          initial={{
            title: item.title ?? '',
            itemType: item.itemType ?? 'RICH_TEXT',
            content: parseContent(item.contentJson ?? item.content),
            sortOrder: item.sortOrder ?? 1,
          }}
          onSave={handleSave}
          onCancel={() => router.push(detailPath)}
          isPending={isPending}
        />
      )}
    </div>
  );
}
