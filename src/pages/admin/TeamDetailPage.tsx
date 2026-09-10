import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, UserCheck, Users, Plus, X } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Select, EmptyState } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';
import type { TeamMember } from '../../types';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { lang, showToast } = useApp();
  
  useMockStore();
  const team = mockStore.getTeam(teamId || '');
  const agents = mockStore.getAgents();
  const department = team ? mockStore.getDepartment(team.department_id) : null;
  const product = department ? mockStore.getProduct(department.product_id) : null;
  const category = team?.category_id ? mockStore.getCategory(team.category_id) : null;

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'LEAD' | 'MEMBER'>('MEMBER');

  if (!team) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{lang === 'fa' ? 'تیم یافت نشد' : 'Team not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/admin/teams')} className="mt-4">
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const getAgentName = (userId: string) => {
    const agent = agents.find(a => a.user_id === userId);
    return agent?.display_name || userId;
  };

  const handleAddMember = () => {
    if (!selectedAgentId) {
      showToast(lang === 'fa' ? 'لطفاً یک کارشناس انتخاب کنید' : 'Please select an agent', 'error');
      return;
    }

    // Check if agent is already a member
    if (team.members.some(m => m.user_id === selectedAgentId)) {
      showToast(lang === 'fa' ? 'این کارشناس قبلاً عضو تیم است' : 'This agent is already a member', 'error');
      return;
    }

    // If adding as LEAD, remove existing LEAD
    let updatedMembers = [...team.members];
    if (selectedRole === 'LEAD') {
      updatedMembers = updatedMembers.map(m => 
        m.role === 'LEAD' ? { ...m, role: 'MEMBER' as const } : m
      );
    }

    const newMember: TeamMember = {
      user_id: selectedAgentId,
      user_name: getAgentName(selectedAgentId),
      role: selectedRole,
    };

    updatedMembers.push(newMember);

    mockStore.updateTeam(team.id, { members: updatedMembers });
    showToast(lang === 'fa' ? 'عضو اضافه شد' : 'Member added', 'success');
    setShowAddMember(false);
    setSelectedAgentId('');
    setSelectedRole('MEMBER');
  };

  const handleRemoveMember = (userId: string) => {
    const updatedMembers = team.members.filter(m => m.user_id !== userId);
    mockStore.updateTeam(team.id, { members: updatedMembers });
    showToast(lang === 'fa' ? 'عضو حذف شد' : 'Member removed', 'success');
  };

  const handleChangeRole = (userId: string, newRole: 'LEAD' | 'MEMBER') => {
    let updatedMembers = team.members.map(m => 
      m.user_id === userId ? { ...m, role: newRole } : m
    );

    // If changing to LEAD, remove existing LEAD
    if (newRole === 'LEAD') {
      updatedMembers = updatedMembers.map(m => 
        m.user_id !== userId && m.role === 'LEAD' ? { ...m, role: 'MEMBER' as const } : m
      );
    }

    mockStore.updateTeam(team.id, { members: updatedMembers });
    showToast(lang === 'fa' ? 'نقش بروزرسانی شد' : 'Role updated', 'success');
  };

  const lead = team.members.find(m => m.role === 'LEAD');
  const members = team.members.filter(m => m.role === 'MEMBER');

  // Get available agents (not already in team)
  const availableAgents = agents.filter(a => 
    !team.members.some(m => m.user_id === a.user_id)
  );

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/admin/teams" className="hover:text-brand-600">
          {lang === 'fa' ? 'تیم‌ها' : 'Teams'}
        </Link>
        <span>/</span>
        <span className="text-text">{team.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/teams')} className="p-1 rounded hover:bg-surface-hover">
            <ChevronLeft className="h-5 w-5 flip-rtl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <div className="flex items-center gap-2 mt-1">
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
        </div>
      </div>

      {/* Team Info */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {lang === 'fa' ? 'اطلاعات تیم' : 'Team Information'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-muted">{lang === 'fa' ? 'نامک' : 'Slug'}</p>
            <p className="font-mono text-sm">{team.slug}</p>
          </div>
          {product && (
            <div>
              <p className="text-sm text-text-muted">{lang === 'fa' ? 'محصول' : 'Product'}</p>
              <p className="text-sm">{product.name}</p>
            </div>
          )}
          {department && (
            <div>
              <p className="text-sm text-text-muted">{lang === 'fa' ? 'دپارتمان' : 'Department'}</p>
              <p className="text-sm">{department.name}</p>
            </div>
          )}
          {category && (
            <div>
              <p className="text-sm text-text-muted">{lang === 'fa' ? 'دسته‌بندی' : 'Category'}</p>
              <p className="text-sm">{category.name}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Lead */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {lang === 'fa' ? 'سرتیم' : 'Team Lead'}
        </h2>
        {lead ? (
          <div className="flex items-center justify-between p-4 bg-surface-alt rounded-lg">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-warning-500" />
              <div>
                <p className="font-medium">{getAgentName(lead.user_id)}</p>
                <p className="text-xs text-text-muted">{lang === 'fa' ? 'سرتیم' : 'Lead'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleChangeRole(lead.user_id, 'MEMBER')}
            >
              {lang === 'fa' ? 'تغییر به عضو' : 'Change to Member'}
            </Button>
          </div>
        ) : (
          <EmptyState
            icon={<UserCheck className="h-12 w-12 text-text-muted" />}
            title={lang === 'fa' ? 'سرتیمی انتخاب نشده' : 'No lead selected'}
            description={lang === 'fa' 
              ? 'یک سرتیم برای این تیم انتخاب کنید.' 
              : 'Select a lead for this team.'}
            action={
              <Button onClick={() => { setShowAddMember(true); setSelectedRole('LEAD'); }}>
                <UserCheck className="h-4 w-4" /> {lang === 'fa' ? 'انتخاب سرتیم' : 'Select Lead'}
              </Button>
            }
          />
        )}
      </Card>

      {/* Members */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {lang === 'fa' ? 'اعضای تیم' : 'Team Members'} ({members.length})
          </h2>
          <Button onClick={() => { setShowAddMember(true); setSelectedRole('MEMBER'); }}>
            <Plus className="h-4 w-4" /> {lang === 'fa' ? 'افزودن عضو' : 'Add Member'}
          </Button>
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12 text-text-muted" />}
            title={lang === 'fa' ? 'هنوز عضوی اضافه نشده' : 'No members added yet'}
            description={lang === 'fa' 
              ? 'کارشناسان را به این تیم اضافه کنید.' 
              : 'Add agents to this team.'}
          />
        ) : (
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.user_id} className="flex items-center justify-between p-4 bg-surface-alt rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="font-medium">{getAgentName(member.user_id)}</p>
                    <p className="text-xs text-text-muted">{lang === 'fa' ? 'عضو' : 'Member'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleChangeRole(member.user_id, 'LEAD')}
                  >
                    {lang === 'fa' ? 'تغییر به سرتیم' : 'Make Lead'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveMember(member.user_id)}
                  >
                    <X className="h-4 w-4 text-danger-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Member Modal */}
      <Modal 
        open={showAddMember} 
        onClose={() => setShowAddMember(false)} 
        title={selectedRole === 'LEAD' 
          ? (lang === 'fa' ? 'انتخاب سرتیم' : 'Select Lead')
          : (lang === 'fa' ? 'افزودن عضو' : 'Add Member')}
      >
        <div className="space-y-4">
          {availableAgents.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12 text-text-muted" />}
              title={lang === 'fa' ? 'کارشناسی موجود نیست' : 'No agents available'}
              description={lang === 'fa' 
                ? 'همه کارشناسان قبلاً عضو این تیم هستند.' 
                : 'All agents are already members of this team.'}
            />
          ) : (
            <>
              <Select
                label={lang === 'fa' ? 'کارشناس' : 'Agent'}
                value={selectedAgentId}
                onChange={setSelectedAgentId}
                options={availableAgents.map(a => ({
                  value: a.user_id,
                  label: a.display_name,
                }))}
              />
              {selectedRole === 'MEMBER' && (
                <Select
                  label={lang === 'fa' ? 'نقش' : 'Role'}
                  value={selectedRole}
                  onChange={(v) => setSelectedRole(v as 'LEAD' | 'MEMBER')}
                  options={[
                    { value: 'MEMBER', label: lang === 'fa' ? 'عضو' : 'Member' },
                    { value: 'LEAD', label: lang === 'fa' ? 'سرتیم' : 'Lead' },
                  ]}
                />
              )}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddMember}>
                  {lang === 'fa' ? 'افزودن' : 'Add'}
                </Button>
                <Button variant="secondary" onClick={() => setShowAddMember(false)}>
                  {lang === 'fa' ? 'انصراف' : 'Cancel'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
