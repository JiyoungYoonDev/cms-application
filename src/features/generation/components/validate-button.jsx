'use client';

import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { validateByScope } from '../services/generation-admin-service';

/**
 * Reusable validation trigger button for any scope.
 * Drop into course / section / lecture / item detail pages.
 *
 * @param {Object} props
 * @param {'COURSE'|'SECTION'|'LECTURE'|'ITEM'} props.scopeType
 * @param {number|string} props.targetId
 * @param {string} [props.label] - Button label override
 * @param {(result: any) => void} [props.onDone] - Called with the new round summary
 * @param {'sm'|'md'} [props.size='md']
 */
export function ValidateButton({ scopeType, targetId, label, onDone, size = 'md' }) {
  const [loading, setLoading] = useState(false);

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-[11px] gap-1'
    : 'px-3 py-1.5 text-xs gap-1.5';

  async function handleClick() {
    const scopeLabel = scopeType.toLowerCase();
    if (!confirm(`Run validation for this ${scopeLabel}?`)) return;

    setLoading(true);
    try {
      const res = await validateByScope(scopeType, targetId);
      const summary = res?.data ?? res;
      onDone?.(summary);
    } catch (e) {
      alert('Validation failed: ' + (e?.message ?? 'unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center ${sizeClasses} font-medium rounded-lg
                  bg-violet-500/10 text-violet-600 hover:bg-violet-500/20
                  disabled:opacity-50 transition-colors`}
      title={`Validate ${scopeType.toLowerCase()} content`}
    >
      {loading
        ? <Loader2 size={12} className='animate-spin' />
        : <ShieldCheck size={12} />}
      {loading ? 'Validating...' : (label ?? 'Validate')}
    </button>
  );
}
