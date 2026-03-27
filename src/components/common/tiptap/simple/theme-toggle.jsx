'use client';

// --- UI Primitives ---
import { Button } from '@/components/common/tiptap/tiptap-ui-primitive/button';

// --- Icons ---
import { MoonStarIcon } from '@/components/common/tiptap/tiptap-icons/moon-star-icon';
import { SunIcon } from '@/components/common/tiptap/tiptap-icons/sun-icon';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cms-theme';

function getInitialDark() {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const dark = getInitialDark();
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      variant='ghost'
    >
      {isDarkMode ? (
        <MoonStarIcon className='tiptap-button-icon' />
      ) : (
        <SunIcon className='tiptap-button-icon' />
      )}
    </Button>
  );
}
