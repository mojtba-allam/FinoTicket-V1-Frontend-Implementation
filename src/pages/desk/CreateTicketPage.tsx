import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea, Select, Card } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { mockCustomers, mockCategories, mockDepartments, mockAgents } from '../../data/mock';
import { useApp } from '../../app/providers';
import { useCanMutate } from '../../components/ProtectedRoute';

export default function CreateTicketPage() {
  const { t, lang, showToast, product } = useApp();
  const navigate = useNavigate();
  const canMutate = useCanMutate();

  // VIEWER gate - redirect to forbidden
  if (!canMutate) {
    navigate('/forbidden');
    return null;
  }

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customer, setCustomer] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [assignee, setAssignee] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      showToast(lang === 'fa' ? 'لطفاً موضوع را وارد کنید' : 'Please enter a subject', 'error');
      return;
    }

    const selectedCustomer = mockCustomers.find(c => c.id === customer);
    const selectedCategory = mockCategories.find(c => c.id === category);
    const selectedDepartment = mockDepartments.find(d => d.id === department);
    const selectedAssignee = mockAgents.find(a => a.user_id === assignee);

    const newTicket = mockStore.createTicket({
      subject,
      description,
      product_id: product.id,
      product_name: product.name,
      customer_id: customer,
      customer_name: selectedCustomer?.display_name,
      category_id: category,
      category_name: selectedCategory?.name,
      department_id: department,
      department_name: selectedDepartment?.name,
      assignee_id: assignee,
      assignee_name: selectedAssignee?.display_name,
      priority: priority as any,
    });

    showToast(lang === 'fa' ? 'تیکت با موفقیت ایجاد شد' : 'Ticket created successfully', 'success');
    navigate(`/desk/tickets/${newTicket.id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-surface-hover">
          <svg className="h-5 w-5 flip-rtl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{t.ticket.create}</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label={t.ticket.subject} 
            value={subject} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} 
            required 
            placeholder={lang === 'fa' ? 'موضوع تیکت را وارد کنید' : 'Enter ticket subject'} 
          />
          
          <Textarea 
            label={t.ticket.description} 
            value={description} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
            placeholder={lang === 'fa' ? 'توضیحات مشکل یا درخواست...' : 'Describe the issue or request...'} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={lang === 'fa' ? 'مشتری' : 'Customer'} 
              options={mockCustomers.map(c => ({ value: c.id, label: c.display_name }))} 
              value={customer} 
              onChange={setCustomer} 
              placeholder={lang === 'fa' ? 'انتخاب مشتری' : 'Select customer'} 
            />
            
            <Select 
              label={lang === 'fa' ? 'اولویت' : 'Priority'} 
              options={Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))} 
              value={priority} 
              onChange={setPriority} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={lang === 'fa' ? 'دسته‌بندی' : 'Category'} 
              options={mockCategories.map(c => ({ value: c.id, label: c.name }))} 
              value={category} 
              onChange={setCategory} 
              placeholder={lang === 'fa' ? 'انتخاب دسته' : 'Select category'} 
            />
            
            <Select 
              label={lang === 'fa' ? 'دپارتمان' : 'Department'} 
              options={mockDepartments.map(d => ({ value: d.id, label: d.name }))} 
              value={department} 
              onChange={setDepartment} 
              placeholder={lang === 'fa' ? 'انتخاب دپارتمان' : 'Select department'} 
            />
          </div>

          <Select 
            label={lang === 'fa' ? 'ارجاع به' : 'Assign to'} 
            options={mockAgents.map(a => ({ value: a.user_id, label: a.display_name }))} 
            value={assignee} 
            onChange={setAssignee} 
            placeholder={lang === 'fa' ? 'انتخاب کارشناس' : 'Select agent'} 
          />

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit">{t.common.create}</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>{t.common.cancel}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
