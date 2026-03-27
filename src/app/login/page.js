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
    <div className='min-h-screen flex items-center justify-center bg-zinc-950'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col items-center gap-2 mb-8'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700 text-white'>
            <Building2 size={24} />
          </div>
          <h1 className='text-xl font-bold text-zinc-100'>CodeHaja CMS</h1>
          <p className='text-sm text-zinc-400'>관리자 계정으로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className='bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-zinc-300' htmlFor='email'>
              이메일
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500'
              placeholder='admin@codehaja.com'
              required
              autoComplete='email'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-zinc-300' htmlFor='password'>
              비밀번호
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-zinc-500'
              placeholder='••••••••'
              required
              autoComplete='current-password'
            />
          </div>

          {error && (
            <p className='text-sm text-red-400'>{error}</p>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='h-9 w-full rounded-md bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
