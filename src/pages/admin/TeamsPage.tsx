import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';
import { Button, Card, Badge, EmptyState } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function TeamsPage() {
  const navigate = useNavigate();
  const { lang } = useApp();
  
  useMockStore();
  const teams = mockStore.getTeams();
  const agents = mockStore.getAgents();

  const getLeadName = (team: any) => {
    const lead = team.members.find((m: any) => m.role === 'LEAD');
    if (!lead) return null;
    const agent = agents.find(a => a.user_id === lead.user_id);
    return agent?.display_name || lead.user_name;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {lang === 'fa' ? 'تیم‌ها' : 'Teams'}
        </h1>
      </div>

      {teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'هنوز تیمی ثبت نشده' : 'No teams yet'}
          description={lang === 'fa' 
            ? 'برای مدیریت تیم‌ها به صفحه دپارتمان یا دسته‌بندی بروید.' 
            : 'To manage teams, go to a department or category page.'}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {teams.map(team => {
            const leadName = getLeadName(team);
            const memberCount = team.members.length;
            
            return (
              <div 
                key={team.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/admin/teams/${team.id}`)}
              >
                <Card>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-brand-500" />
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-xs text-text-muted font-mono">{team.slug}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={team.scope === 'DEPARTMENT' ? 'brand' : 'info'}>
                        {team.scope === 'DEPARTMENT' 
                          ? (lang === 'fa' ? 'دپارتمان' : 'Department')
                          : (lang === 'fa' ? 'دسته‌بندی' : 'Category')}
                      </Badge>
                      <Badge variant={team.status === 'ACTIVE' ? 'success' : 'default'}>
                        {team.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-border">
                    {leadName && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="h-4 w-4 text-warning-500" />
                        <span className="text-text-muted">{lang === 'fa' ? 'سرتیم:' : 'Lead:'}</span>
                        <span className="font-medium">{leadName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-text-muted" />
                      <span className="text-text-muted">{lang === 'fa' ? 'اعضا:' : 'Members:'}</span>
                      <span className="font-medium">{memberCount}</span>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
