'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/admin/courses');
    } catch (err) {
      setError(err.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-admin-light'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col items-center gap-2 mb-8'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-admin-primary text-white'>
            <Building2 size={24} />
          </div>
          <h1 className='text-xl font-bold text-admin-dark'>CodeHaja CMS</h1>
          <p className='text-sm text-muted-foreground'>관리자 계정으로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className='bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-admin-dark' htmlFor='email'>
              이메일
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring'
              placeholder='admin@codehaja.com'
              required
              autoComplete='email'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-admin-dark' htmlFor='password'>
              비밀번호
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring'
              placeholder='••••••••'
              required
              autoComplete='current-password'
            />
          </div>

          {error && (
            <p className='text-sm text-red-500'>{error}</p>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='h-9 w-full rounded-md bg-admin-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
