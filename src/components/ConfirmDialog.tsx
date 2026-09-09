import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Button } from './ui';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'تایید',
  cancelLabel = 'انصراف',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const icons = {
    danger: <XCircle className="h-12 w-12 text-danger-500" />,
    warning: <AlertTriangle className="h-12 w-12 text-warning-500" />,
    info: <Info className="h-12 w-12 text-brand-500" />,
    success: <CheckCircle2 className="h-12 w-12 text-success-500" />,
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const,
    success: 'success' as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="mb-4">{icons[variant]}</div>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={buttonVariants[variant]}
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'در حال پردازش...' : confirmLabel}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
