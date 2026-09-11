import React, { useState } from 'react';
import { FileSearch, Search } from 'lucide-react';
import { Card, Badge, Input, Select } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function PlatformAuditPage() {
  const { lang } = useApp();
  useMockStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  
  // Get audit logs from mockStore
  const auditLogs = mockStore.getAuditLogs();

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = !actionFilter || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="success">{lang === 'fa' ? 'ایجاد' : 'Create'}</Badge>;
      case 'UPDATE':
        return <Badge variant="brand">{lang === 'fa' ? 'بروزرسانی' : 'Update'}</Badge>;
      case 'DELETE':
        return <Badge variant="danger">{lang === 'fa' ? 'حذف' : 'Delete'}</Badge>;
      case 'SUSPEND':
        return <Badge variant="warning">{lang === 'fa' ? 'تعلیق' : 'Suspend'}</Badge>;
      case 'RESTORE':
        return <Badge variant="success">{lang === 'fa' ? 'بازیابی' : 'Restore'}</Badge>;
      default:
        return <Badge variant="default">{action}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return lang === 'fa' ? `${diffMins} دقیقه پیش` : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return lang === 'fa' ? `${diffHours} ساعت پیش` : `${diffHours} hours ago`;
    } else {
      return lang === 'fa' ? `${diffDays} روز پیش` : `${diffDays} days ago`;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {lang === 'fa' ? 'گزارش حسابرسی' : 'Audit Log'}
        </h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input 
              placeholder={lang === 'fa' ? 'جستجو در گزارش‌ها...' : 'Search logs...'}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select 
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه اقدامات' : 'All Actions' },
              { value: 'CREATE', label: lang === 'fa' ? 'ایجاد' : 'Create' },
              { value: 'UPDATE', label: lang === 'fa' ? 'بروزرسانی' : 'Update' },
              { value: 'DELETE', label: lang === 'fa' ? 'حذف' : 'Delete' },
              { value: 'SUSPEND', label: lang === 'fa' ? 'تعلیق' : 'Suspend' },
              { value: 'RESTORE', label: lang === 'fa' ? 'بازیابی' : 'Restore' },
            ]}
          />
        </div>
      </Card>

      {/* Audit Logs */}
      <Card>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileSearch className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">
              {lang === 'fa' ? 'گزارشی یافت نشد' : 'No logs found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-surface-alt rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getActionBadge(log.action)}
                    <span className="font-medium">{log.entity_type}</span>
                    <span className="text-xs text-text-muted font-mono">{log.entity_id}</span>
                  </div>
                  <p className="text-sm mb-1">
                    {log.metadata && typeof log.metadata === 'object' && 'details' in log.metadata 
                      ? String(log.metadata.details)
                      : `${log.action} ${log.entity_type}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{log.actor_name}</span>
                    <span>•</span>
                    <span>{formatTimestamp(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
