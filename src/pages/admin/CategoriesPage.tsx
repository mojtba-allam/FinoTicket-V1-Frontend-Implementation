import React from 'react';
import { Tags } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { mockCategories } from '../../data/mock';
import { useApp } from '../../app/providers';

export default function AdminCategoriesPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.categories}</h1>
      </div>
      <Card padding={false}>
        <div className="p-4 space-y-3">
          {mockCategories.map(cat => (
            <div key={cat.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Tags className="h-5 w-5 text-brand-500" />
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-text-muted font-mono">{cat.slug}</span>
                </div>
                <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'default'}>
                  {cat.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                </Badge>
              </div>
              {cat.children && cat.children.length > 0 && (
                <div className="mr-8 mt-2 space-y-1.5">
                  {cat.children.map(child => (
                    <div key={child.id} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1 h-1 rounded-full bg-text-muted" />
                      <span>{child.name}</span>
                      <span className="text-xs text-text-muted font-mono">{child.slug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
