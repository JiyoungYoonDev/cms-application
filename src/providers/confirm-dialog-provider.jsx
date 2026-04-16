'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ConfirmContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback(
    ({ title = 'Are you sure?', description = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default' } = {}) =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setState({ title, description, confirmLabel, cancelLabel, variant });
      }),
    [],
  );

  const handleAction = (result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AlertDialog open={!!state} onOpenChange={(open) => !open && handleAction(false)}>
        {state && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{state.title}</AlertDialogTitle>
              {state.description && (
                <AlertDialogDescription>{state.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleAction(false)}>
                {state.cancelLabel}
              </AlertDialogCancel>
              <AlertDialogAction
                variant={state.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={() => handleAction(true)}
              >
                {state.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used within ConfirmDialogProvider');
  return confirm;
}
