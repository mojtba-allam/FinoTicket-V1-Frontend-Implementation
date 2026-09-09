import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Inbox, Users, Search, BookOpen, BarChart3, Shield, Globe, Webhook, Zap, Clock, Brain, Menu, X, Bell, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui';
import { useApp } from '../../app/providers';

export default function LandingPage() {
  const { lang, setLang, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setHeroVisible(true);
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: lang === 'fa' ? 'صندوق ورودی هوشمند' : 'Smart Inbox',
      desc: lang === 'fa' ? 'فیلترهای پیشرفته، SLA خودکار، ارجاع هوشمند' : 'Advanced filters, auto SLA, smart routing',
      visual: 'inbox',
    },
    {
      title: lang === 'fa' ? 'دستیار هوشمند AI' : 'AI Copilot',
      desc: lang === 'fa' ? 'پیشنهاد پاسخ، تحلیل احساسات، تیکت‌های مشابه' : 'Reply suggestions, sentiment analysis, similar tickets',
      visual: 'ai',
    },
    {
      title: lang === 'fa' ? 'جستجوی ترکیبی' : 'Hybrid Search',
      desc: lang === 'fa' ? 'کلمه‌ای + معنایی + RAG برای یافتن سریع پاسخ' : 'Keyword + semantic + RAG for fast answers',
      visual: 'search',
    },
    {
      title: lang === 'fa' ? 'تحلیل‌های جامع' : 'Comprehensive Analytics',
      desc: lang === 'fa' ? 'KPIs، نمودارهای عملکرد، گزارش‌های SLA' : 'KPIs, performance charts, SLA reports',
      visual: 'analytics',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-brand-800)' }}>
                  {lang === 'fa' ? 'فینوتیکت' : 'FinoTicket'}
                </h1>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#product" className="text-sm font-medium hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                {lang === 'fa' ? 'محصول' : 'Product'}
              </a>
              <a href="#features" className="text-sm font-medium hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                {lang === 'fa' ? 'امکانات' : 'Features'}
              </a>
              <a href="#security" className="text-sm font-medium hover:text-brand-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                {lang === 'fa' ? 'امنیت' : 'Security'}
              </a>
              <button 
                onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} 
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors font-medium"
              >
                {lang === 'fa' ? 'EN' : 'فا'}
              </button>
              <Link to="/login">
                <Button variant="ember" size="md">
                  {lang === 'fa' ? 'ورود به پنل' : 'Sign In'}
                </Button>
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border">
              <a href="#product" className="block text-sm font-medium py-2">{lang === 'fa' ? 'محصول' : 'Product'}</a>
              <a href="#features" className="block text-sm font-medium py-2">{lang === 'fa' ? 'امکانات' : 'Features'}</a>
              <a href="#security" className="block text-sm font-medium py-2">{lang === 'fa' ? 'امنیت' : 'Security'}</a>
              <Link to="/login" className="block">
                <Button variant="ember" className="w-full">{lang === 'fa' ? 'ورود به پنل' : 'Sign In'}</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Full Bleed Product Mock */}
      <section className="relative pt-16 overflow-hidden" style={{ background: 'var(--gradient-mesh)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Brand Hero - Compact */}
            <div className="text-center mb-8">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-none tracking-tight" style={{ color: 'var(--color-brand-900)' }}>
                {lang === 'fa' ? (
                  <>
                    میز پشتیبانی
                    <br />
                    <span style={{ color: 'var(--color-brand-500)' }}>هوشمند فینو</span>
                  </>
                ) : (
                  <>
                    Smart Support
                    <br />
                    <span style={{ color: 'var(--color-brand-500)' }}>Desk for Fino</span>
                  </>
                )}
              </h2>
              <p className="text-base sm:text-lg mb-6 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                {lang === 'fa' 
                  ? 'سیستم مدیریت تیکت چندمستأجری با هوش مصنوعی و جستجوی معنایی'
                  : 'Multi-tenant ticket management with AI and semantic search'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login">
                  <Button size="lg" variant="ember" className="px-8 py-3 font-bold">
                    {lang === 'fa' ? 'شروع رایگان' : 'Start Free'}
                  </Button>
                </Link>
                <Link to="/desk">
                  <Button size="lg" variant="secondary" className="px-8 py-3">
                    {lang === 'fa' ? 'مشاهده دمو' : 'View Demo'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Full-Bleed Agent Desk Mock - Edge to Edge */}
            <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="bg-white rounded-t-2xl shadow-2xl border border-border overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(11, 124, 140, 0.25)' }}>
                {/* Mock Header */}
                <div className="bg-brand-50 border-b border-border px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                        <Ticket className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--color-brand-700)' }}>
                        {lang === 'fa' ? 'فینوتیکت' : 'FinoTicket'}
                      </span>
                      <div className="h-6 w-px bg-border mx-2" />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {lang === 'fa' ? 'فینوپال' : 'Finopal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Bell className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-ember-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                        ع
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Content - 3 Column Layout */}
                <div className="flex h-[450px] sm:h-[500px]">
                  {/* Left: Inbox */}
                  <div className="w-72 sm:w-80 border-r border-border bg-surface-alt hidden sm:block">
                    <div className="p-4 border-b border-border bg-white">
                      <h3 className="font-bold text-sm mb-3">{lang === 'fa' ? 'صندوق ورودی' : 'Inbox'}</h3>
                      <div className="flex gap-1">
                        {['All', 'My', 'Unassigned'].map(tab => (
                          <button key={tab} className="px-3 py-1 text-xs rounded-md bg-brand-50 text-brand-700 font-medium">
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-80px)]">
                      {[
                        { num: 'FT-1001', title: lang === 'fa' ? 'مشکل در ورود' : 'Login issue', status: 'OPEN', priority: 'HIGH', time: lang === 'fa' ? '۲ ساعت' : '2h' },
                        { num: 'FT-1002', title: lang === 'fa' ? 'درخواست تغییر شماره' : 'Phone change', status: 'IN_PROGRESS', priority: 'NORMAL', time: lang === 'fa' ? '۵ ساعت' : '5h' },
                        { num: 'FT-1003', title: lang === 'fa' ? 'خطای پرداخت' : 'Payment error', status: 'OPEN', priority: 'CRITICAL', time: lang === 'fa' ? '۱ روز' : '1d' },
                      ].map((ticket, i) => (
                        <div key={i} className="p-4 border-b border-border hover:bg-white cursor-pointer transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{ticket.num}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-danger-50 text-danger-600 font-medium">
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-2">{ticket.title}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                              {ticket.status}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ticket.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center: Conversation */}
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-border bg-white">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>FT-1001</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">OPEN</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-danger-50 text-danger-600 font-medium">HIGH</span>
                        <div className="flex items-center gap-1 mr-auto">
                          <Clock className="h-3 w-3 text-warning-500" />
                          <span className="text-xs text-warning-600 font-medium">
                            {lang === 'fa' ? 'SLA: ۴۵ دقیقه' : 'SLA: 45m'}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base">
                        {lang === 'fa' ? 'مشکل در ورود به حساب کاربری' : 'Login issue to account'}
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-alt">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">س</div>
                        <div className="flex-1 bg-white rounded-lg p-3 sm:p-4 border border-border">
                          <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                            {lang === 'fa' ? 'سارا احمدی • ۲ ساعت پیش' : 'Sara • 2h ago'}
                          </p>
                          <p className="text-sm">
                            {lang === 'fa' 
                              ? 'سلام، من نمی‌تونم وارد حساب کاربریم بشم. خطای "اطلاعات ورود نامعتبر" نمایش داده میشه.'
                              : 'Hi, I cannot login to my account. Getting "Invalid credentials" error.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">ع</div>
                        <div className="flex-1 bg-white rounded-lg p-3 sm:p-4 border border-border">
                          <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                            {lang === 'fa' ? 'علی محمدی • ۱ ساعت پیش' : 'Ali • 1h ago'}
                          </p>
                          <p className="text-sm">
                            {lang === 'fa' 
                              ? 'سلام سارا خانم. لطفاً مرورگر خود را به‌روزرسانی کنید و مجدداً تلاش کنید.'
                              : 'Hi Sara. Please update your browser and try again.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 border-t border-border bg-white">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={lang === 'fa' ? 'پاسخ خود را بنویسید...' : 'Type your reply...'}
                          className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <Button size="sm" variant="primary">
                          {lang === 'fa' ? 'ارسال' : 'Send'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right: AI Copilot */}
                  <div className="w-64 sm:w-72 border-l border-border bg-white hidden md:block">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5" style={{ color: 'var(--color-accent-500)' }} />
                        <h3 className="font-bold text-sm">{lang === 'fa' ? 'دستیار هوشمند' : 'AI Copilot'}</h3>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-400/20 text-accent-600 font-medium">Beta</span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
                      <div className="bg-surface-alt rounded-lg p-3">
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          {lang === 'fa' ? 'تحلیل احساسات' : 'Sentiment'}
                        </p>
                        <p className="text-sm font-medium mb-1">
                          {lang === 'fa' ? 'منفی - کاربر ناراحت' : 'Negative - frustrated'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-warning-500" style={{ width: '85%' }} />
                          </div>
                          <span className="text-xs font-medium">85%</span>
                        </div>
                      </div>
                      <div className="border border-brand-200 rounded-lg p-3 bg-brand-50">
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-brand-700)' }}>
                          {lang === 'fa' ? 'پیشنهاد پاسخ' : 'Suggested Reply'}
                        </p>
                        <p className="text-xs mb-3 leading-relaxed">
                          {lang === 'fa' 
                            ? 'سلام سارا خانم، مشکل شما شناسایی شد. لطفاً کش مرورگر خود را پاک کنید...'
                            : 'Hi Sara, we identified the issue. Please clear your browser cache...'}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="success" className="flex-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            {lang === 'fa' ? 'قبول' : 'Accept'}
                          </Button>
                          <Button size="sm" variant="ghost" className="flex-1 text-xs">
                            {lang === 'fa' ? 'رد' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative gradient orbs */}
              <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: 'var(--color-accent-500)' }} />
              <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: 'var(--color-ember-500)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features - Interactive Product Showcase (NOT card farm) */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--color-brand-900)' }}>
              {lang === 'fa' ? 'امکانات کلیدی' : 'Key Features'}
            </h3>
          </div>

          {/* Interactive Feature Showcase */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Feature List */}
            <div className="space-y-3">
              {features.map((feature, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-right p-6 rounded-xl border-2 transition-all ${
                    activeFeature === i
                      ? 'border-brand-500 bg-brand-50 shadow-lg'
                      : 'border-border hover:border-brand-300 bg-white'
                  }`}
                >
                  <h4 className={`text-lg font-bold mb-2 ${activeFeature === i ? 'text-brand-700' : ''}`} style={{ color: activeFeature === i ? 'var(--color-brand-700)' : 'var(--color-brand-800)' }}>
                    {feature.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{feature.desc}</p>
                </button>
              ))}
            </div>

            {/* Feature Visual */}
            <div className="relative">
              <div className="bg-surface-alt rounded-2xl p-8 border border-border">
                {activeFeature === 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-10 bg-brand-50 border-b border-border flex items-center px-4">
                      <Inbox className="h-5 w-5 text-brand-600" />
                      <span className="text-sm font-bold mr-2 text-brand-700">{lang === 'fa' ? 'صندوق ورودی' : 'Inbox'}</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {['All', 'My Tickets', 'Unassigned', 'SLA Risk'].map(filter => (
                        <div key={filter} className="h-10 bg-surface-alt rounded border border-border flex items-center px-3">
                          <span className="text-sm">{filter}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 mr-auto">12</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeFeature === 1 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-10 bg-accent-400/20 border-b border-accent-200 flex items-center px-4">
                      <Brain className="h-5 w-5 text-accent-600" />
                      <span className="text-sm font-bold mr-2 text-accent-700">{lang === 'fa' ? 'دستیار هوشمند' : 'AI Copilot'}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-surface-alt rounded-lg p-3">
                        <p className="text-xs font-medium mb-2 text-text-muted">{lang === 'fa' ? 'تحلیل احساسات' : 'Sentiment'}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-warning-500" style={{ width: '85%' }} />
                          </div>
                          <span className="text-sm font-bold">85%</span>
                        </div>
                      </div>
                      <div className="border-2 border-brand-300 rounded-lg p-3 bg-brand-50">
                        <p className="text-xs font-bold mb-2 text-brand-700">{lang === 'fa' ? 'پیشنهاد پاسخ' : 'Suggested Reply'}</p>
                        <p className="text-xs leading-relaxed">...</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="success" className="flex-1 text-xs">✓</Button>
                          <Button size="sm" variant="ghost" className="flex-1 text-xs">✗</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeFeature === 2 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-10 bg-brand-50 border-b border-border flex items-center px-4">
                      <Search className="h-5 w-5 text-brand-600" />
                      <span className="text-sm font-bold mr-2 text-brand-700">{lang === 'fa' ? 'جستجو' : 'Search'}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex gap-2">
                        {['Keyword', 'Semantic', 'Hybrid'].map(mode => (
                          <button key={mode} className="px-3 py-1 text-xs rounded-md bg-brand-500 text-white font-medium">
                            {mode}
                          </button>
                        ))}
                      </div>
                      <div className="h-10 bg-surface-alt rounded border border-border" />
                      <div className="space-y-2">
                        <div className="p-3 bg-surface-alt rounded border border-border">
                          <p className="text-xs font-mono text-text-muted">FT-0892</p>
                          <p className="text-sm font-medium mt-1">{lang === 'fa' ? 'مشکل ورود بعد از آپدیت' : 'Login issue after update'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeFeature === 3 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-10 bg-brand-50 border-b border-border flex items-center px-4">
                      <BarChart3 className="h-5 w-5 text-brand-600" />
                      <span className="text-sm font-bold mr-2 text-brand-700">{lang === 'fa' ? 'تحلیل‌ها' : 'Analytics'}</span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-brand-50 rounded-lg p-3 border border-brand-200">
                          <p className="text-2xl font-black text-brand-700">24</p>
                          <p className="text-xs text-brand-600">{lang === 'fa' ? 'تیکت باز' : 'Open'}</p>
                        </div>
                        <div className="bg-success-50 rounded-lg p-3 border border-success-200">
                          <p className="text-2xl font-black text-success-700">92%</p>
                          <p className="text-xs text-success-600">SLA</p>
                        </div>
                      </div>
                      <div className="h-32 bg-surface-alt rounded border border-border flex items-end justify-around p-2">
                        {[40, 65, 45, 80, 60, 75, 55].map((h, i) => (
                          <div key={i} className="w-8 bg-brand-500 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Surfaces - Framed Screens */}
      <section id="product" className="py-20" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-black mb-4" style={{ color: 'var(--color-brand-900)' }}>
              {lang === 'fa' ? 'سه سطح دسترسی یکپارچه' : 'Three Unified Interfaces'}
            </h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { icon: Inbox, title: lang === 'fa' ? 'میز کار کارشناس' : 'Agent Desk', desc: lang === 'fa' ? 'صندوق ورودی هوشمند، مکالمه زنده، دستیار AI' : 'Smart inbox, live conversation, AI assistant' },
              { icon: BarChart3, title: lang === 'fa' ? 'کنسول مدیریت' : 'Admin Console', desc: lang === 'fa' ? 'محصولات، تیم‌ها، SLA، اتوماسیون، تحلیل‌ها' : 'Products, teams, SLA, automation, analytics' },
              { icon: Globe, title: lang === 'fa' ? 'ویجت مشتری' : 'Customer Widget', desc: lang === 'fa' ? 'قابل جاسازی با برندینگ سفارشی' : 'Embeddable with custom branding' },
            ].map((surface, i) => (
              <div key={i} className="group">
                <div className="bg-white rounded-2xl p-6 border-2 border-transparent group-hover:border-brand-300 transition-all shadow-lg">
                  <div className="bg-surface-alt rounded-xl shadow-lg overflow-hidden mb-4">
                    <div className="h-8 bg-brand-50 border-b border-border flex items-center px-3">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-danger-500" />
                        <div className="h-2 w-2 rounded-full bg-warning-500" />
                        <div className="h-2 w-2 rounded-full bg-success-500" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex gap-2 mb-3">
                        <div className="h-6 w-16 bg-brand-50 rounded" />
                        <div className="h-6 w-16 bg-surface-alt rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-12 bg-white rounded border border-border" />
                        <div className="h-12 bg-brand-50 rounded border border-brand-200" />
                      </div>
                    </div>
                  </div>
                  <surface.icon className="h-8 w-8 mb-3" style={{ color: 'var(--color-brand-500)' }} />
                  <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-brand-800)' }}>
                    {surface.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {surface.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security - Tenant Isolation Diagram */}
      <section id="security" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-black mb-6" style={{ color: 'var(--color-brand-900)' }}>
                {lang === 'fa' ? 'امنیت و ایزولاسیون کامل' : 'Complete Security & Isolation'}
              </h3>
              <ul className="space-y-4">
                {[
                  { title: lang === 'fa' ? 'ایزولاسیون چندمستأجری' : 'Multi-tenant isolation', desc: lang === 'fa' ? 'داده‌های هر مستأجر کاملاً جدا' : 'Each tenant data completely separate' },
                  { title: lang === 'fa' ? 'احراز هویت سطحی' : 'Role-based access', desc: lang === 'fa' ? 'کنترل دسترسی بر اساس نقش' : 'Access control by role' },
                  { title: lang === 'fa' ? 'وبهوک‌های امضا شده' : 'Signed webhooks', desc: lang === 'fa' ? 'تایید اصالت با HMAC' : 'Authenticity with HMAC' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--color-success-500)' }}>
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-brand-800)' }}>{item.title}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tenant Isolation Diagram */}
            <div className="relative">
              <div className="bg-surface-alt rounded-2xl p-8 border border-border">
                <div className="space-y-4">
                  {['Tenant A', 'Tenant B', 'Tenant C'].map((tenant, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border-2 border-brand-300 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-6 w-6 text-brand-600" />
                        <span className="font-bold text-brand-700">{tenant}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-12 bg-brand-50 rounded border border-brand-200 flex items-center justify-center">
                          <Ticket className="h-4 w-4 text-brand-600" />
                        </div>
                        <div className="h-12 bg-accent-400/20 rounded border border-accent-200 flex items-center justify-center">
                          <Users className="h-4 w-4 text-accent-600" />
                        </div>
                        <div className="h-12 bg-success-50 rounded border border-success-200 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-success-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Widget Section - Real Preview */}
      <section id="widget" className="py-20" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black mb-4" style={{ color: 'var(--color-brand-900)' }}>
              {lang === 'fa' ? 'ویجت قابل جاسازی' : 'Embeddable Widget'}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-6">
                {[
                  { title: lang === 'fa' ? 'نصب آسان' : 'Easy install', desc: lang === 'fa' ? 'با یک خط کد JavaScript' : 'One line of JavaScript' },
                  { title: lang === 'fa' ? 'برندینگ کامل' : 'Full branding', desc: lang === 'fa' ? 'رنگ، لوگو و متن سفارشی' : 'Custom colors, logo, text' },
                  { title: lang === 'fa' ? 'احراز هویت امن' : 'Secure auth', desc: lang === 'fa' ? 'توکن کوتاه‌مدت امضا شده' : 'Short-lived signed token' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Zap className="h-6 w-6 shrink-0 mt-0.5" style={{ color: 'var(--color-accent-500)' }} />
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-brand-800)' }}>{item.title}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/widget">
                  <Button size="lg" variant="primary">
                    {lang === 'fa' ? 'مشاهده دمو ویجت' : 'View Widget Demo'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Real Widget Preview - No dashed boxes */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="h-12 px-4 flex items-center" style={{ background: 'var(--color-brand-500)' }}>
                <Ticket className="h-5 w-5 text-white" />
                <span className="text-white font-bold mr-2">{lang === 'fa' ? 'پشتیبانی فینوپال' : 'Finopal Support'}</span>
              </div>
              <div className="p-4 space-y-3">
                <Button variant="primary" className="w-full">
                  <Zap className="h-4 w-4" />
                  {lang === 'fa' ? 'تیکت جدید' : 'New Ticket'}
                </Button>
                <div className="space-y-2">
                  {[
                    { num: 'FT-1001', title: lang === 'fa' ? 'مشکل در ورود' : 'Login issue', status: lang === 'fa' ? 'باز' : 'Open' },
                    { num: 'FT-1002', title: lang === 'fa' ? 'درخواست تغییر شماره' : 'Phone change', status: lang === 'fa' ? 'در حال بررسی' : 'In Progress' },
                  ].map((ticket, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border hover:bg-surface-hover cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{ticket.num}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">{ticket.status}</span>
                      </div>
                      <p className="text-sm font-medium">{ticket.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-black mb-6 text-white">
            {lang === 'fa' ? 'آماده شروع هستید؟' : 'Ready to Start?'}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" variant="ember" className="px-10 py-4 text-base font-bold">
                {lang === 'fa' ? 'شروع رایگان' : 'Start Free'}
              </Button>
            </Link>
            <Link to="/desk">
              <Button size="lg" variant="secondary" className="px-10 py-4 text-base bg-white text-brand-700 hover:bg-white/90">
                {lang === 'fa' ? 'مشاهده دمو' : 'View Demo'}
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
                <span className="font-black" style={{ color: 'var(--color-brand-700)' }}>
                  {lang === 'fa' ? 'فینوتیکت' : 'FinoTicket'}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {lang === 'fa' ? 'سیستم مدیریت تیکت حرفه‌ای' : 'Professional ticket management'}
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--color-brand-800)' }}>
                {lang === 'fa' ? 'محصول' : 'Product'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/desk" className="hover:text-brand-600" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'fa' ? 'میز کار' : 'Desk'}</Link></li>
                <li><Link to="/widget" className="hover:text-brand-600" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'fa' ? 'ویجت' : 'Widget'}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--color-brand-800)' }}>
                {lang === 'fa' ? 'شرکت' : 'Company'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-brand-600" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'fa' ? 'درباره ما' : 'About'}</a></li>
                <li><a href="#" className="hover:text-brand-600" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'fa' ? 'تماس' : 'Contact'}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--color-brand-800)' }}>
                {lang === 'fa' ? 'قانونی' : 'Legal'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-brand-600" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'fa' ? 'حریم خصوصی' : 'Privacy'}</Link></li>
                <li><Link to="/terms" className="hover:text-brand-600" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'fa' ? 'شرایط استفاده' : 'Terms'}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <p>© 2024 FinoTicket. {lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
