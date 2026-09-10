import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { useApp } from '../../app/providers';

export default function PlatformSettingsPage() {
  const { lang, showToast } = useApp();
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxTenants, setMaxTenants] = useState('100');
  const [defaultLanguage, setDefaultLanguage] = useState('fa');
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSave = () => {
    showToast(lang === 'fa' ? 'تنظیمات ذخیره شد' : 'Settings saved', 'success');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {lang === 'fa' ? 'تنظیمات پلتفرم' : 'Platform Settings'}
      </h1>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="h-5 w-5 text-brand-500" />
            <h3 className="font-semibold">{lang === 'fa' ? 'تنظیمات عمومی' : 'General Settings'}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lang === 'fa' ? 'حالت نگهداری' : 'Maintenance Mode'}</p>
                <p className="text-sm text-text-muted">
                  {lang === 'fa' 
                    ? 'فعال‌سازی حالت نگهداری دسترسی کاربران را محدود می‌کند' 
                    : 'Enabling maintenance mode restricts user access'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lang === 'fa' ? 'اعلان‌های ایمیلی' : 'Email Notifications'}</p>
                <p className="text-sm text-text-muted">
                  {lang === 'fa' 
                    ? 'دریافت اعلان‌های سیستم از طریق ایمیل' 
                    : 'Receive system notifications via email'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Limits */}
        <Card>
          <h3 className="font-semibold mb-4">{lang === 'fa' ? 'محدودیت‌ها' : 'Limits'}</h3>
          
          <div className="space-y-4">
            <Input 
              label={lang === 'fa' ? 'حداکثر تعداد مستأجران' : 'Maximum Tenants'}
              value={maxTenants}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxTenants(e.target.value)}
              type="number"
            />
            
            <Select 
              label={lang === 'fa' ? 'زبان پیش‌فرض' : 'Default Language'}
              value={defaultLanguage}
              onChange={setDefaultLanguage}
              options={[
                { value: 'fa', label: lang === 'fa' ? 'فارسی' : 'Persian' },
                { value: 'en', label: lang === 'fa' ? 'انگلیسی' : 'English' },
              ]}
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            {lang === 'fa' ? 'ذخیره تنظیمات' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
