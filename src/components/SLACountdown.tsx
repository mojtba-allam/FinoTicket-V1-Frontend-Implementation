import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SLACountdownProps {
  dueAt: string;
  type: 'first_response' | 'resolution';
  size?: 'sm' | 'md' | 'lg';
}

export function SLACountdown({ dueAt, type, size = 'md' }: SLACountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(dueAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(dueAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [dueAt]);

  const isBreached = timeLeft.total <= 0;
  const isWarning = !isBreached && timeLeft.total < 1800000; // 30 min

  const sizes = {
    sm: { container: 'text-xs px-2 py-0.5', icon: 'h-3 w-3' },
    md: { container: 'text-sm px-3 py-1', icon: 'h-4 w-4' },
    lg: { container: 'text-base px-4 py-1.5', icon: 'h-5 w-5' },
  };

  const bgColor = isBreached ? 'bg-danger-50' : isWarning ? 'bg-warning-50' : 'bg-success-50';
  const textColor = isBreached ? 'text-danger-600' : isWarning ? 'text-warning-600' : 'text-success-600';
  const Icon = isBreached ? AlertTriangle : Clock;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-medium ${bgColor} ${textColor} ${sizes[size].container}`}>
      <Icon className={sizes[size].icon} />
      <span>
        {isBreached 
          ? (type === 'first_response' ? 'نقض پاسخ' : 'نقض حل')
          : formatTime(timeLeft)
        }
      </span>
    </div>
  );
}

function calculateTimeLeft(dueAt: string) {
  const difference = new Date(dueAt).getTime() - new Date().getTime();
  
  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function formatTime(timeLeft: ReturnType<typeof calculateTimeLeft>) {
  if (timeLeft.days > 0) {
    return `${timeLeft.days} روز ${timeLeft.hours} ساعت`;
  }
  if (timeLeft.hours > 0) {
    return `${timeLeft.hours}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
  }
  return `${timeLeft.minutes}:${String(timeLeft.seconds).padStart(2, '0')}`;
}
