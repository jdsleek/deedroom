'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div
        className="absolute inset-0 bg-warm-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative z-10 w-full lg:max-w-lg',
          'bg-white shadow-xl',
          'rounded-t-3xl lg:rounded-2xl',
          'animate-sheet-up lg:animate-scale-in',
          'max-h-[90vh] overflow-y-auto',
          'p-6',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-warm-300 lg:hidden" />
        {title && (
          <h2 id="modal-title" className="font-display mb-4 text-xl font-bold text-warm-900">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
