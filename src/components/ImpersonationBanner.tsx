import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './ui';
import { useApp } from '../app/providers';

export function ImpersonationBanner() {
  const { impersonation, stopImpersonation, lang } = useApp();
  const navigate = useNavigate();

  if (!impersonation) return null;

  const handleExit = () => {
    stopImpersonation();
    navigate(`/platform/tenants/${impersonation.tenantId}`);
  };

  return (
    <div className="bg-warning-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-medium">
          {lang === 'fa' 
            ? `در حال مشاهده به عنوان ادمین ${impersonation.tenantName}` 
            : `Impersonating ${impersonation.tenantName} Admin`}
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleExit}
        className="text-white hover:bg-warning-600"
      >
        <X className="h-4 w-4 mr-1" />
        {lang === 'fa' ? 'خروج' : 'Exit'}
      </Button>
    </div>
  );
}
