'use client';

import { useState } from 'react';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useCreateProblemBookMutation } from '@/hooks/queries';

export default function Page() {
  const router = useRouter();
  const createProblemBookMutation = useCreateProblemBookMutation({
    onSuccess: (bookId) => {
      alert('Success!');
      router.push(`/admin/books/${bookId}/roadmap`);
    },
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 1,
    keywords: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProblemBookMutation.mutateAsync({
        problem_title: formData.title,
        problem_description: formData.description,
        problem_category: formData.category,
        problem_difficulty: Number(formData.difficulty),
        problem_keywords: formData.keywords
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      });
    } catch (err) {
      alert(err.message);
    }
  };
  return (
    <div>
      <FieldSet className='w-full max-w-xs'>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='title'>Title</FieldLabel>
            <Input
              id='title'
              type='text'
              placeholder='Enter the title...'
              name='title'
              value={formData.title}
              onChange={handleChange}
            />
            <FieldLabel htmlFor='feedback'>Feedback</FieldLabel>
            <Textarea
              id='feedback'
              placeholder='Your feedback helps us improve...'
              rows={4}
              name='feedback'
              value={formData.feedback}
              onChange={handleChange}
            />
            <FieldDescription>
              Share your thoughts about our service.
            </FieldDescription>

            <FieldLabel htmlFor='difficulty'>Difficulty</FieldLabel>
            <Select
              value={String(formData.difficulty)}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  difficulty: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select difficulty' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='1'>Beginner (1)</SelectItem>
                  <SelectItem value='2'>Intermediate (2)</SelectItem>
                  <SelectItem value='3'>Advanced (3)</SelectItem>
                  <SelectItem value='4'>Expert (4)</SelectItem>
                  <SelectItem value='5'>Master (5)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <FieldLabel htmlFor='keywords'>Keywords</FieldLabel>
            <Input
              id='keywords'
              type='text'
              placeholder='Enter keywords...'
              name='keywords'
              value={formData.keywords}
              onChange={handleChange}
            />

            <Button
              onClick={handleSubmit}
              disabled={createProblemBookMutation.isPending}
            >
              {createProblemBookMutation.isPending ? 'Saving...' : 'Submit'}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
