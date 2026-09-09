import React from 'react';
import { CheckCircle2, UserPlus, Plus, Edit, MessageSquare, Clock, AlertTriangle } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'assigned' | 'message' | 'updated' | 'sla_warning' | 'sla_breached';
  title: string;
  description?: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface TimelineProps {
  events: TimelineEvent[];
}

function getEventIcon(type: TimelineEvent['type']) {
  switch (type) {
    case 'created':
      return <Plus className="h-4 w-4 text-white" />;
    case 'status_change':
      return <Edit className="h-4 w-4 text-white" />;
    case 'assigned':
      return <UserPlus className="h-4 w-4 text-white" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-white" />;
    case 'updated':
      return <Edit className="h-4 w-4 text-white" />;
    case 'sla_warning':
      return <Clock className="h-4 w-4 text-white" />;
    case 'sla_breached':
      return <AlertTriangle className="h-4 w-4 text-white" />;
    default:
      return <CheckCircle2 className="h-4 w-4 text-white" />;
  }
}

function getEventColor(type: TimelineEvent['type']) {
  switch (type) {
    case 'created':
      return 'bg-success-500';
    case 'status_change':
      return 'bg-brand-500';
    case 'assigned':
      return 'bg-accent-500';
    case 'message':
      return 'bg-brand-400';
    case 'updated':
      return 'bg-brand-500';
    case 'sla_warning':
      return 'bg-warning-500';
    case 'sla_breached':
      return 'bg-danger-500';
    default:
      return 'bg-brand-500';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'همین الان';
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return date.toLocaleDateString('fa-IR');
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-muted">رویدادی ثبت نشده است</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-3 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 pb-6">
              <p className="text-sm font-medium">{event.title}</p>
              {event.description && (
                <p className="text-xs text-text-muted mt-1">{event.description}</p>
              )}
              <p className="text-xs text-text-muted mt-1">
                {event.actor} • {formatTimestamp(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
