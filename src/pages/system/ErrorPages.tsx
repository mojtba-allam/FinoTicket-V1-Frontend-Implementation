import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '../../components/ui';
import { useApp } from '../../app/providers';

export function ForbiddenPage() {
  const { lang } = useApp();
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="h-20 w-20 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-10 w-10 text-danger-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {lang === 'fa' ? 'دسترسی ممنوع' : 'Access Denied'}
        </h1>
        <p className="text-text-muted mb-4">
          {lang === 'fa' 
            ? 'شما مجوز مشاهده این صفحه را ندارید.'
            : 'You do not have permission to view this page.'}
        </p>
        <Link to="/desk">
          <Button>
            {lang === 'fa' ? 'بازگشت به میز کار' : 'Back to Desk'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const { lang } = useApp();
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-500 mb-4">۴۰۴</h1>
        <h2 className="text-xl font-bold mb-2">
          {lang === 'fa' ? 'صفحه یافت نشد' : 'Page Not Found'}
        </h2>
        <p className="text-text-muted mb-4">
          {lang === 'fa'
            ? 'صفحه مورد نظر وجود ندارد یا منتقل شده است.'
            : 'The page you are looking for does not exist or has been moved.'}
        </p>
        <Link to="/desk">
          <Button>
            {lang === 'fa' ? 'بازگشت به میز کار' : 'Back to Desk'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
