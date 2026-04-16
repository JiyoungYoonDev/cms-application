'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center gap-6 py-24'>
      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
        <AlertTriangle className='h-8 w-8 text-destructive' />
      </div>
      <div className='space-y-2 text-center'>
        <h2 className='text-xl font-bold'>Something went wrong</h2>
        <p className='text-sm text-muted-foreground max-w-md'>
          An unexpected error occurred. You can try again or go back to the
          dashboard.
        </p>
      </div>
      <div className='flex gap-3'>
        <Button variant='outline' onClick={() => (window.location.href = '/admin/dashboard')}>
          Go to Dashboard
        </Button>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
