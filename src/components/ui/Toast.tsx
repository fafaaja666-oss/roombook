'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof Info; wrap: string; iconColor: string }> = {
  success: { icon: CheckCircle2, wrap: 'border-success/25', iconColor: 'text-success' },
  error: { icon: XCircle, wrap: 'border-danger/25', iconColor: 'text-danger' },
  info: { icon: Info, wrap: 'border-line', iconColor: 'text-gold-dark' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'success' }: ToastInput) => {
      const id = (idRef.current += 1);
      setItems((list) => [...list, { id, title, description, variant }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {items.map((item) => {
          const style = VARIANT_STYLES[item.variant];
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              className={cn(
                'animate-slide-in-right pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface p-4 shadow-lg shadow-navy/10',
                style.wrap
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                {item.description && <p className="mt-0.5 text-sm text-muted">{item.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Tutup notifikasi"
                className="-mr-1 rounded-md p-1 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
