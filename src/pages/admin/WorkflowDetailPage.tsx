import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, GripVertical, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button, Card, Input, Select, Badge, Modal } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection, describeError } from '../../lib/api/hooks';
import { getDataApi } from '../../lib/api/dataApi';
import { isLiveMode } from '../../lib/api/config';
import { useApp } from '../../app/providers';
import type { Workflow, WorkflowStep } from '../../types';

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, showToast } = useApp();

  // Live mode loads from the API; mock mode reads the in-memory store.
  const { data: workflows, loading } = useCollection(
    () => mockStore.getWorkflows(),
    (api) => api.workflows.list(),
  );

  const workflow = id ? workflows.find(item => item.id === id) ?? null : null;
  
  const [showAddStep, setShowAddStep] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [stepType, setStepType] = useState<WorkflowStep['type']>('CONDITION');
  const [stepKey, setStepKey] = useState('');
  const [stepConfig, setStepConfig] = useState<string>('{}');
  
  // Mock execution logs
  const [executionLogs] = useState([
    { id: '1', status: 'COMPLETED', started_at: '2024-01-15T10:30:00Z', duration: 1250 },
    { id: '2', status: 'COMPLETED', started_at: '2024-01-15T09:15:00Z', duration: 980 },
    { id: '3', status: 'FAILED', started_at: '2024-01-15T08:00:00Z', duration: 2100 },
    { id: '4', status: 'COMPLETED', started_at: '2024-01-14T16:45:00Z', duration: 1100 },
    { id: '5', status: 'COMPLETED', started_at: '2024-01-14T15:20:00Z', duration: 890 },
  ]);

  if (!workflow) {
    if (loading) return null;
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{lang === 'fa' ? 'گردش کار یافت نشد' : 'Workflow not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/admin/workflows')} className="mt-4">
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const handleAddStep = () => {
    setEditingStep(null);
    setStepType('CONDITION');
    setStepKey('');
    setStepConfig('{}');
    setShowAddStep(true);
  };

  const handleEditStep = (step: WorkflowStep) => {
    setEditingStep(step);
    setStepType(step.type);
    setStepKey(step.step_key);
    setStepConfig(JSON.stringify(step.config, null, 2));
    setShowAddStep(true);
  };

  const handleSaveStep = async () => {
    try {
      const config = JSON.parse(stepConfig);

      if (editingStep) {
        // No API method to update a step; mock-only for now.
        mockStore.updateWorkflowStep(workflow.id, editingStep.id, {
          type: stepType,
          step_key: stepKey,
          config,
        });
        showToast(lang === 'fa' ? 'مرحله بروزرسانی شد' : 'Step updated', 'success');
      } else if (isLiveMode()) {
        await getDataApi().workflows.addStep(workflow.id, {
          type: stepType,
          step_key: stepKey,
          config,
          sort_order: workflow.steps.length,
        });
        showToast(lang === 'fa' ? 'مرحله اضافه شد' : 'Step added', 'success');
        setShowAddStep(false);
        window.location.reload();
        return;
      } else {
        mockStore.addWorkflowStep(workflow.id, {
          type: stepType,
          step_key: stepKey,
          config,
          sort_order: workflow.steps.length,
        });
        showToast(lang === 'fa' ? 'مرحله اضافه شد' : 'Step added', 'success');
      }
      
      setShowAddStep(false);
    } catch (error) {
      if (isLiveMode() && !(error instanceof SyntaxError)) {
        showToast(describeError(error as Error) ?? 'Save failed', 'error');
        return;
      }
      showToast(lang === 'fa' ? 'فرمت JSON نامعتبر است' : 'Invalid JSON format', 'error');
    }
  };

  const handleDeleteStep = (stepId: string) => {
    mockStore.removeWorkflowStep(workflow.id, stepId);
    showToast(lang === 'fa' ? 'مرحله حذف شد' : 'Step removed', 'success');
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    mockStore.moveWorkflowStep(workflow.id, stepId, direction);
  };

  const getStepTypeLabel = (type: WorkflowStep['type']) => {
    const labels = {
      CONDITION: lang === 'fa' ? 'شرط' : 'Condition',
      ACTION: lang === 'fa' ? 'عمل' : 'Action',
      DELAY: lang === 'fa' ? 'تأخیر' : 'Delay',
      WEBHOOK: lang === 'fa' ? 'وبهوک' : 'Webhook',
      NOTIFICATION: lang === 'fa' ? 'اعلان' : 'Notification',
      AI: lang === 'fa' ? 'هوش مصنوعی' : 'AI',
    };
    return labels[type];
  };

  const getStepTypeColor = (type: WorkflowStep['type']): 'brand' | 'success' | 'warning' | 'info' | 'default' => {
    const colors: Record<WorkflowStep['type'], 'brand' | 'success' | 'warning' | 'info' | 'default'> = {
      CONDITION: 'brand',
      ACTION: 'success',
      DELAY: 'warning',
      WEBHOOK: 'info',
      NOTIFICATION: 'default',
      AI: 'brand',
    };
    return colors[type];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/workflows')} className="p-1 rounded hover:bg-surface-hover">
          <ChevronLeft className="h-5 w-5 flip-rtl" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{workflow.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={workflow.status === 'ACTIVE' ? 'success' : workflow.status === 'DRAFT' ? 'warning' : 'default'}>
              {workflow.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : 
               workflow.status === 'DRAFT' ? (lang === 'fa' ? 'پیش‌نویس' : 'Draft') : 
               (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
            </Badge>
            <span className="text-sm text-text-muted">
              {lang === 'fa' ? 'رویداد' : 'Event'}: {workflow.event}
            </span>
            <span className="text-sm text-text-muted">
              {lang === 'fa' ? 'نسخه' : 'Version'}: {workflow.version}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Steps Editor */}
        <div className="col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{lang === 'fa' ? 'مراحل گردش کار' : 'Workflow Steps'}</h2>
              <Button size="sm" onClick={handleAddStep}>
                <Plus className="h-4 w-4" /> {lang === 'fa' ? 'افزودن مرحله' : 'Add Step'}
              </Button>
            </div>

            {workflow.steps.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p>{lang === 'fa' ? 'هنوز مرحله‌ای اضافه نشده است' : 'No steps added yet'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflow.steps
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((step, index) => (
                    <div key={step.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <GripVertical className="h-4 w-4 text-text-muted" />
                          <span className="text-xs font-mono text-text-muted">#{index + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStepTypeColor(step.type)}>
                              {getStepTypeLabel(step.type)}
                            </Badge>
                            <span className="font-mono text-sm text-text-muted">{step.step_key}</span>
                          </div>
                          
                          <div className="bg-surface-alt rounded p-2 text-xs font-mono">
                            <pre className="overflow-x-auto">
                              {JSON.stringify(step.config, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStep(step)}
                          >
                            {lang === 'fa' ? 'ویرایش' : 'Edit'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4 text-danger-500" />
                          </Button>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveStep(step.id, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveStep(step.id, 'down')}
                              disabled={index === workflow.steps.length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>

        {/* Execution Logs */}
        <div>
          <Card>
            <h2 className="text-lg font-semibold mb-4">{lang === 'fa' ? 'گزارش اجرا' : 'Execution Logs'}</h2>
            
            <div className="space-y-2">
              {executionLogs.map((log) => (
                <div key={log.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.status === 'COMPLETED' && <CheckCircle className="h-4 w-4 text-success-500" />}
                      {log.status === 'FAILED' && <XCircle className="h-4 w-4 text-danger-500" />}
                      {log.status === 'RUNNING' && <Clock className="h-4 w-4 text-warning-500" />}
                      <Badge variant={log.status === 'COMPLETED' ? 'success' : log.status === 'FAILED' ? 'danger' : 'warning'}>
                        {log.status === 'COMPLETED' ? (lang === 'fa' ? 'موفق' : 'Completed') :
                         log.status === 'FAILED' ? (lang === 'fa' ? 'ناموفق' : 'Failed') :
                         (lang === 'fa' ? 'در حال اجرا' : 'Running')}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-muted">{formatDuration(log.duration)}</span>
                  </div>
                  <div className="text-xs text-text-muted">
                    {new Date(log.started_at).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Step Modal */}
      <Modal
        open={showAddStep}
        onClose={() => setShowAddStep(false)}
        title={editingStep ? (lang === 'fa' ? 'ویرایش مرحله' : 'Edit Step') : (lang === 'fa' ? 'افزودن مرحله' : 'Add Step')}
      >
        <div className="space-y-4">
          <Select
            label={lang === 'fa' ? 'نوع مرحله' : 'Step Type'}
            value={stepType}
            onChange={(value) => setStepType(value as WorkflowStep['type'])}
            options={[
              { value: 'CONDITION', label: lang === 'fa' ? 'شرط' : 'Condition' },
              { value: 'ACTION', label: lang === 'fa' ? 'عمل' : 'Action' },
              { value: 'DELAY', label: lang === 'fa' ? 'تأخیر' : 'Delay' },
              { value: 'WEBHOOK', label: lang === 'fa' ? 'وبهوک' : 'Webhook' },
              { value: 'NOTIFICATION', label: lang === 'fa' ? 'اعلان' : 'Notification' },
              { value: 'AI', label: lang === 'fa' ? 'هوش مصنوعی' : 'AI' },
            ]}
          />
          
          <Input
            label={lang === 'fa' ? 'کلید مرحله' : 'Step Key'}
            value={stepKey}
            onChange={(e) => setStepKey(e.target.value)}
            placeholder="e.g., check_priority"
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {lang === 'fa' ? 'پیکربندی (JSON)' : 'Configuration (JSON)'}
            </label>
            <textarea
              value={stepConfig}
              onChange={(e) => setStepConfig(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-border rounded-lg font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveStep}>
              {editingStep ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'افزودن' : 'Add')}
            </Button>
            <Button variant="secondary" onClick={() => setShowAddStep(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
