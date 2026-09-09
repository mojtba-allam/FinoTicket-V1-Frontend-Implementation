import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button, Card, Input, Select, Badge } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';
import type { Channel, ProductStatus } from '../../types';

export default function AdminProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, showToast } = useApp();
  
  useMockStore();
  const product = mockStore.getProduct(id || '');

  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [status, setStatus] = useState<ProductStatus>(product?.status || 'ACTIVE');
  const [channels, setChannels] = useState<Channel[]>(product?.channels || ['WEB']);
  const [primaryColor, setPrimaryColor] = useState(product?.widget_branding?.primary_color || '#0B7C8C');
  const [logoUrl, setLogoUrl] = useState(product?.widget_branding?.logo_url || '');
  const [welcomeText, setWelcomeText] = useState(product?.widget_branding?.welcome_text || '');
  const [widgetTitle, setWidgetTitle] = useState(product?.widget_branding?.title || '');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setStatus(product.status);
      setChannels(product.channels);
      setPrimaryColor(product.widget_branding?.primary_color || '#0B7C8C');
      setLogoUrl(product.widget_branding?.logo_url || '');
      setWelcomeText(product.widget_branding?.welcome_text || '');
      setWidgetTitle(product.widget_branding?.title || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{lang === 'fa' ? 'محصول یافت نشد' : 'Product not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/admin/products')} className="mt-4">
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    mockStore.updateProduct(id!, {
      name,
      slug,
      status: status as any,
      channels,
      widget_branding: {
        primary_color: primaryColor,
        logo_url: logoUrl || undefined,
        welcome_text: welcomeText,
        title: widgetTitle,
      },
    });
    showToast(lang === 'fa' ? 'محصول بروزرسانی شد' : 'Product updated', 'success');
  };

  const availableChannels = ['WEB', 'WIDGET', 'EMAIL', 'CHAT', 'SMS', 'PHONE', 'API', 'WHATSAPP'];

  const toggleChannel = (channel: Channel) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter(c => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-1 rounded hover:bg-surface-hover">
          <ChevronLeft className="h-5 w-5 flip-rtl" />
        </button>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Badge variant={status === 'ACTIVE' ? 'success' : status === 'SUSPENDED' ? 'danger' : 'default'}>
          {status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : 
           status === 'SUSPENDED' ? (lang === 'fa' ? 'معلق' : 'Suspended') : 
           (lang === 'fa' ? 'آرشیو' : 'Archived')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <h3 className="font-semibold mb-4">{lang === 'fa' ? 'تنظیمات عمومی' : 'General Settings'}</h3>
          <div className="space-y-4">
            <Input 
              label={lang === 'fa' ? 'نام' : 'Name'} 
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <Input 
              label={lang === 'fa' ? 'نامک' : 'Slug'} 
              value={slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
            />
            <Select 
              label={lang === 'fa' ? 'وضعیت' : 'Status'} 
              options={[
                { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' },
                { value: 'SUSPENDED', label: lang === 'fa' ? 'معلق' : 'Suspended' },
                { value: 'ARCHIVED', label: lang === 'fa' ? 'آرشیو' : 'Archived' },
              ]}
              value={status}
              onChange={(v) => setStatus(v as ProductStatus)}
            />
          </div>
        </Card>

        {/* Channels */}
        <Card>
          <h3 className="font-semibold mb-4">{lang === 'fa' ? 'کانال‌ها' : 'Channels'}</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableChannels.map(channel => (
              <button
                key={channel}
                onClick={() => toggleChannel(channel)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  channels.includes(channel)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-border hover:border-brand-300'
                }`}
              >
                <span className="text-sm font-medium">{channel}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Widget Branding */}
        <Card className="col-span-2">
          <h3 className="font-semibold mb-4">{lang === 'fa' ? 'برندینگ ویجت' : 'Widget Branding'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {lang === 'fa' ? 'رنگ اصلی' : 'Primary Color'}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrimaryColor(e.target.value)}
                  placeholder="#0B7C8C"
                />
              </div>
            </div>
            <Input 
              label={lang === 'fa' ? 'عنوان ویجت' : 'Widget Title'} 
              value={widgetTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidgetTitle(e.target.value)}
              placeholder={lang === 'fa' ? 'پشتیبانی فینوپال' : 'Finopal Support'}
            />
            <Input 
              label={lang === 'fa' ? 'متن خوش‌آمدگویی' : 'Welcome Text'} 
              value={welcomeText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWelcomeText(e.target.value)}
              placeholder={lang === 'fa' ? 'سلام! چطور می‌تونیم کمکتون کنیم؟' : 'Hello! How can we help you?'}
            />
            <Input 
              label={lang === 'fa' ? 'URL لوگو' : 'Logo URL'} 
              value={logoUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 rounded-lg border border-border bg-surface-alt">
            <p className="text-sm font-medium mb-3">{lang === 'fa' ? 'پیش‌نمایش' : 'Preview'}</p>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-sm">
              <div className="p-3 text-white" style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center gap-2">
                  {logoUrl && <img src={logoUrl} alt="Logo" className="h-5 w-5" />}
                  <span className="font-bold text-sm">{widgetTitle || 'Widget Title'}</span>
                </div>
                <p className="text-xs opacity-90 mt-1">{welcomeText || 'Welcome text'}</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="h-8 rounded border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: primaryColor, color: primaryColor }}>
                  + {lang === 'fa' ? 'تیکت جدید' : 'New Ticket'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave}>
          {lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin/products')}>
          {lang === 'fa' ? 'انصراف' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
}
