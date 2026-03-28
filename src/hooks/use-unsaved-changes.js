'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Shows a browser warning when navigating away with unsaved changes.
 * - Covers: refresh, tab close, browser back/forward
 * - For in-app navigation, call `confirmLeave()` before router.push/back
 *
 * @param {boolean} isDirty - true when there are unsaved changes
 * @returns {{ confirmLeave: () => boolean }}
 */
export function useUnsavedChanges(isDirty) {
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // Browser-level: refresh, close tab, browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // For in-app navigation — call this before router.push / router.back
  const confirmLeave = useCallback(() => {
    if (!isDirtyRef.current) return true;
    return window.confirm('저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?');
  }, []);

  return { confirmLeave };
}
