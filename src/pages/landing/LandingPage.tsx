import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Inbox, Users, Search, BookOpen, BarChart3, Shield, Globe, Webhook, Zap, Clock, Brain, ChevronLeft, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui';
import { fa, en, type Lang } from '../../i18n';

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('fa');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = lang === 'fa' ? fa : en;

  const features = [
    { icon: Inbox, title: 'مدیریت تیکت', desc: 'صندوق ورودی هوشمند با فیلترهای پیشرفته و SLA خودکار' },
    { icon: Users, title: 'پروفایل مشتری ۳۶۰°', desc: 'مشاهده کامل تاریخچه، هویت‌ها و تعاملات مشتری' },
    { icon: Search, title: 'جستجوی ترکیبی', desc: 'جستجوی کلمه‌ای + معنایی + RAG برای یافتن سریع پاسخ' },
    { icon: BookOpen, title: 'پایگاه دانش', desc: 'مقالات با تکه‌بندی خودکار و جستجوی هوشمند' },
    { icon: Brain, title: 'دستیار هوشمند', desc: 'پیشنهاد پاسخ، دسته‌بندی و اولویت با تایید انسانی' },
    { icon: BarChart3, title: 'تحلیل‌ها', desc: 'گزارش‌های جامع از عملکرد تیم و رضایت مشتری' },
    { icon: Webhook, title: 'وبهوک و API', desc: 'یکپارچگی با سیستم‌های خارجی از طریق REST API' },
    { icon: Shield, title: 'امنیت چندمستأجری', desc: 'ایزولاسیون کامل داده‌ها با احراز هویت سطحی' },
  ];

  const surfaces = [
    { title: 'میز کار کارشناس', desc: 'صندوق ورودی، مکالمه، دستیار هوشمند', icon: Inbox },
    { title: 'کنسول مدیریت', desc: 'محصولات، تیم‌ها، SLA، اتوماسیون', icon: BarChart3 },
    { title: 'ویجت مشتری', desc: 'قابل جاسازی در محصول با برندینگ سفارشی', icon: Globe },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-mesh)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-brand-700)' }}>فینوتیکت</h1>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>FinoTicket</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>امکانات</a>
              <a href="#security" className="text-sm font-medium hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>امنیت</a>
              <a href="#widget" className="text-sm font-medium hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>ویجت</a>
              <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors">
                {lang === 'fa' ? 'EN' : 'فا'}
              </button>
              <Link to="/login">
                <Button variant="ember">ورود به پنل</Button>
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border">
              <a href="#features" className="block text-sm font-medium py-2" style={{ color: 'var(--color-text-secondary)' }}>امکانات</a>
              <a href="#security" className="block text-sm font-medium py-2" style={{ color: 'var(--color-text-secondary)' }}>امنیت</a>
              <a href="#widget" className="block text-sm font-medium py-2" style={{ color: 'var(--color-text-secondary)' }}>ویجت</a>
              <Link to="/login" className="block">
                <Button variant="ember" className="w-full">ورود به پنل</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-brand-800)' }}>
              میز پشتیبانی چندمستأجری
              <br />
              <span style={{ color: 'var(--color-brand-500)' }}>برای محصولات فینو</span>
            </h2>
            <p className="text-lg sm:text-xl mb-10 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              سیستم مدیریت تیکت حرفه‌ای با هوش مصنوعی، جستجوی معنایی و ویجت قابل جاسازی
              <br />
              طراحی شده برای تیم‌های پشتیبانی مدرن
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" variant="ember" className="px-8">
                  ورود به پنل
                </Button>
              </Link>
              <Link to="/desk">
                <Button size="lg" variant="secondary" className="px-8">
                  مشاهده دمو میزکار
                </Button>
              </Link>
              <Link to="/widget">
                <Button size="lg" variant="ghost" className="px-8">
                  ویجت مشتری
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--color-accent-500)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--color-ember-500)' }} />
      </section>

      {/* Product Surfaces */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-brand-800)' }}>
              سه سطح دسترسی یکپارچه
            </h3>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              از میز کار کارشناس تا کنسول مدیریت و ویجت مشتری
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {surfaces.map((surface, i) => (
              <div key={i} className="group relative p-8 rounded-2xl border-2 border-border hover:border-brand-300 transition-all duration-300 hover:shadow-xl">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: 'var(--color-brand-50)' }}>
                  <surface.icon className="h-8 w-8" style={{ color: 'var(--color-brand-600)' }} />
                </div>
                <h4 className="text-xl font-bold mb-3" style={{ color: 'var(--color-brand-800)' }}>{surface.title}</h4>
                <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{surface.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-brand-800)' }}>
              امکانات کلیدی
            </h3>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              همه چیزی که برای پشتیبانی حرفه‌ای نیاز دارید
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-border hover:shadow-lg transition-shadow">
                <feature.icon className="h-10 w-10 mb-4" style={{ color: 'var(--color-brand-500)' }} />
                <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--color-brand-800)' }}>{feature.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Shield className="h-16 w-16 mb-6" style={{ color: 'var(--color-brand-500)' }} />
              <h3 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-brand-800)' }}>
                امنیت و ایزولاسیون کامل
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--color-success-500)' }}>
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>ایزولاسیون چندمستأجری</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>داده‌های هر مستأجر کاملاً جدا و امن</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--color-success-500)' }}>
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>احراز هویت سطحی</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>کنترل دسترسی بر اساس نقش و محدوده</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--color-success-500)' }}>
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>وبهوک‌های امضا شده</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>تایید اصالت رویدادها با HMAC</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--color-success-500)' }}>
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>گزارش حسابرسی کامل</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>ردیابی تمام عملیات حساس</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl p-8 flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                <Shield className="h-48 w-48 text-white opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Shield className="h-20 w-20 mx-auto mb-4 opacity-90" />
                    <p className="text-2xl font-bold">امنیت در سطح سازمانی</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Widget Section */}
      <section id="widget" className="py-20" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Globe className="h-16 w-16 mx-auto mb-6" style={{ color: 'var(--color-brand-500)' }} />
            <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-brand-800)' }}>
              ویجت قابل جاسازی
            </h3>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              ویجت پشتیبانی را با برندینگ سفارشی در محصول خود جاسازی کنید
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 mt-0.5" style={{ color: 'var(--color-accent-500)' }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>نصب آسان</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>با یک خط کد JavaScript</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 mt-0.5" style={{ color: 'var(--color-accent-500)' }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>برندینگ کامل</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>رنگ، لوگو و متن سفارشی</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 mt-0.5" style={{ color: 'var(--color-accent-500)' }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>احراز هویت امن</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>توکن کوتاه‌مدت امضا شده</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="h-6 w-6 shrink-0 mt-0.5" style={{ color: 'var(--color-accent-500)' }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-brand-800)' }}>واکنش‌گرا</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>بهینه برای موبایل و دسکتاپ</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/widget">
                  <Button size="lg" variant="primary">مشاهده دمو ویجت</Button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-border">
              <div className="h-12 rounded-lg mb-4 flex items-center px-4" style={{ background: 'var(--color-brand-500)' }}>
                <Ticket className="h-5 w-5 text-white" />
                <span className="text-white font-bold mr-2">پشتیبانی فینوپال</span>
              </div>
              <div className="space-y-3">
                <div className="h-20 rounded-lg border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'var(--color-brand-300)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-brand-600)' }}>تیکت جدید</span>
                </div>
                <div className="h-20 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>تیکت‌های من</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
            آماده شروع هستید؟
          </h3>
          <p className="text-lg mb-10 text-white/80">
            همین حالا میز پشتیبانی حرفه‌ای خود را راه‌اندازی کنید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" variant="ember" className="px-8">
                ورود به پنل
              </Button>
            </Link>
            <Link to="/desk">
              <Button size="lg" variant="secondary" className="px-8 bg-white text-brand-700 hover:bg-white/90">
                مشاهده دمو
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold" style={{ color: 'var(--color-brand-700)' }}>فینوتیکت</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                سیستم مدیریت تیکت حرفه‌ای برای تیم‌های پشتیبانی مدرن
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-brand-800)' }}>محصول</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>امکانات</a></li>
                <li><Link to="/desk" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>میز کار</Link></li>
                <li><Link to="/widget" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>ویجت</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-brand-800)' }}>شرکت</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>درباره ما</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>تماس</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>بلاگ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-brand-800)' }}>قانونی</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>حریم خصوصی</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>شرایط استفاده</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <p>© 2024 FinoTicket. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
