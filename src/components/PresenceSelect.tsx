import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Presence } from '../types';

interface PresenceSelectProps {
  value: Presence;
  onChange: (presence: Presence) => void;
}

const presenceOptions: { value: Presence; label: string; color: string; emoji: string }[] = [
  { value: 'ONLINE', label: 'آنلاین', color: 'bg-success-500', emoji: '🟢' },
  { value: 'AWAY', label: 'دور', color: 'bg-warning-500', emoji: '🟡' },
  { value: 'BUSY', label: 'مشغول', color: 'bg-danger-500', emoji: '🔴' },
  { value: 'OFFLINE', label: 'آفلاین', color: 'bg-gray-400', emoji: '⚫' },
];

export function PresenceSelect({ value, onChange }: PresenceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = presenceOptions.find(p => p.value === value) || presenceOptions[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors text-sm"
        aria-label="وضعیت حضور"
        aria-expanded={isOpen}
      >
        <span className={`h-2 w-2 rounded-full ${current.color}`} />
        <span className="font-medium">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg border border-border shadow-lg z-50 py-1 animate-fade-in">
          {presenceOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-right px-4 py-2 text-sm hover:bg-surface-hover transition-colors flex items-center gap-3 ${
                value === option.value ? 'bg-brand-50 text-brand-700 font-medium' : ''
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${option.color}`} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
