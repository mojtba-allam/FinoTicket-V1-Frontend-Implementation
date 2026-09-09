import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket as TicketIcon } from 'lucide-react';
import { useApp } from '../../app/providers';

export default function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const { lang } = useApp();
  const isPrivacy = type === 'privacy';
  
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
            <TicketIcon className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold" style={{ color: 'var(--color-brand-700)' }}>
            {lang === 'fa' ? 'فینوتیکت' : 'FinoTicket'}
          </span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-brand-800)' }}>
          {isPrivacy 
            ? (lang === 'fa' ? 'سیاست حریم خصوصی' : 'Privacy Policy')
            : (lang === 'fa' ? 'شرایط استفاده' : 'Terms of Service')}
        </h1>
        <div className="prose max-w-none text-text-secondary">
          {isPrivacy ? (
            <>
              <p>
                {lang === 'fa' 
                  ? 'فینوتیکت به حریم خصوصی کاربران خود متعهد است. این سیاست توضیح می‌دهد که ما چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم.'
                  : 'FinoTicket is committed to protecting your privacy. This policy explains how we collect, use, and protect your information.'}
              </p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">
                {lang === 'fa' ? '۱. اطلاعات جمع‌آوری شده' : '1. Information We Collect'}
              </h2>
              <p>
                {lang === 'fa'
                  ? 'ما اطلاعات زیر را جمع‌آوری می‌کنیم: نام، ایمیل، شماره تلفن، و داده‌های مربوط به تیکت‌های پشتیبانی.'
                  : 'We collect the following information: name, email, phone number, and support ticket data.'}
              </p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">
                {lang === 'fa' ? '۲. استفاده از اطلاعات' : '2. How We Use Information'}
              </h2>
              <p>
                {lang === 'fa'
                  ? 'اطلاعات شما فقط برای ارائه خدمات پشتیبانی و بهبود تجربه کاربری استفاده می‌شود.'
                  : 'Your information is used only to provide support services and improve user experience.'}
              </p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">
                {lang === 'fa' ? '۳. امنیت' : '3. Security'}
              </h2>
              <p>
                {lang === 'fa'
                  ? 'ما از رمزنگاری و پروتکل‌های امنیتی استاندارد برای محافظت از اطلاعات شما استفاده می‌کنیم.'
                  : 'We use encryption and standard security protocols to protect your information.'}
              </p>
            </>
          ) : (
            <>
              <p>
                {lang === 'fa'
                  ? 'با استفاده از سرویس فینوتیکت، شما با شرایط زیر موافقت می‌کنید.'
                  : 'By using FinoTicket service, you agree to the following terms.'}
              </p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">
                {lang === 'fa' ? '۱. استفاده مجاز' : '1. Permitted Use'}
              </h2>
              <p>
                {lang === 'fa'
                  ? 'شما متعهد می‌شوید که از سرویس فقط برای اهداف قانونی و مطابق با قوانین جمهوری اسلامی ایران استفاده کنید.'
                  : 'You agree to use the service only for lawful purposes and in accordance with applicable laws.'}
              </p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">
                {lang === 'fa' ? '۲. مسئولیت حساب' : '2. Account Responsibility'}
              </h2>
              <p>
                {lang === 'fa'
                  ? 'شما مسئول حفظ امنیت اطلاعات حساب کاربری خود هستید.'
                  : 'You are responsible for maintaining the security of your account information.'}
              </p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">
                {lang === 'fa' ? '۳. محدودیت مسئولیت' : '3. Limitation of Liability'}
              </h2>
              <p>
                {lang === 'fa'
                  ? 'فینوتیکت مسئولیتی در قبال خسارات ناشی از استفاده نادرست از سرویس ندارد.'
                  : 'FinoTicket is not liable for damages resulting from misuse of the service.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
