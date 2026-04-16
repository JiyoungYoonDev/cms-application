'use client';

import { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';
import { ItemContentRenderer } from './preview/item-content-renderer';

// ─── Modal shell ──────────────────────────────────────────────────────────────

export function ItemPreviewModal({ item, isLoading }) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        disabled={isLoading}
        className='inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <Eye size={14} />
        Preview
      </button>

      {open && (
        <div className='fixed inset-0 z-50 flex flex-col' style={{ background: '#0d0d1a' }}>
          {/* Top bar */}
          <div className='shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#2a2a3e] bg-[#0d0d1a]'>
            <div className='flex items-center gap-3'>
              <Eye size={15} className='text-violet-400' />
              <span className='text-sm font-bold text-white'>{item?.title ?? 'Preview'}</span>
              {item?.itemType && (
                <span className='text-[11px] font-mono bg-[#1a1a2e] border border-[#2a2a3e] text-[#9090a8] px-2 py-0.5 rounded'>
                  {item.itemType}
                </span>
              )}
              <span className='text-xs text-[#5a5a72] border border-[#2a2a3e] rounded px-2 py-0.5'>
                User View
              </span>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='w-8 h-8 flex items-center justify-center rounded-lg text-[#5a5a72] hover:text-white hover:bg-[#2a2a3e] transition-colors'
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className='flex-1 overflow-y-auto'>
            <div className='max-w-2xl mx-auto px-8 py-10'>
              {/* XP badge */}
              {(item?.points ?? 0) > 0 && (
                <div className='inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/30 rounded-full px-3 py-1 mb-4'>
                  <span className='text-violet-400 text-xs font-bold'>+{item.points} XP</span>
                </div>
              )}

              {/* Title */}
              <h1 className='text-2xl font-bold text-white mb-6'>{item?.title ?? 'Untitled'}</h1>

              {/* Content */}
              {isLoading ? (
                <p className='text-[#5a5a72] text-sm'>Loading...</p>
              ) : (
                <ItemContentRenderer item={item} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
