import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Inbox, AlertTriangle, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, KPICard, SegmentedControl, Skeleton, EmptyState } from '../../components/ui';
import { mockAnalytics } from '../../data/mock';
import type { AnalyticsData } from '../../types';
import { useCollection } from '../../lib/api/hooks';
import { useApp } from '../../app/providers';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

/** Client-side slice of the API series for the selected range (7d / 30d / custom). */
function sliceByRange(
  data: AnalyticsData | undefined | null,
  range: '7d' | '30d' | 'custom',
  from: string,
  to: string,
): AnalyticsData {
  // The live loader starts from an empty value before the request resolves, so
  // every field is normalised here — the render path assumes full arrays.
  const safe: AnalyticsData = {
    kpis: data?.kpis ?? mockAnalytics.kpis,
    tickets_over_time: data?.tickets_over_time ?? [],
    by_status: data?.by_status ?? [],
    by_priority: data?.by_priority ?? [],
    sla_compliance: data?.sla_compliance ?? [],
    by_department: data?.by_department ?? [],
    agent_workload: data?.agent_workload ?? [],
    by_channel: data?.by_channel ?? [],
  };

  if (range === 'custom' && (!from || !to)) return safe; // keep previous until both dates are set

  const inRange = (d: string) => {
    if (range === '30d') return true;
    if (range === '7d') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 6);
      return new Date(d) >= new Date(cutoff.toDateString());
    }
    return new Date(d) >= new Date(from) && new Date(d) <= new Date(to);
  };

  return {
    ...safe,
    tickets_over_time: safe.tickets_over_time.filter((r) => inRange(r.date)),
    sla_compliance: safe.sla_compliance.filter((r) => inRange(r.date)),
  };
}

export default function AnalyticsPage() {
  const { t, product, lang } = useApp();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'custom'>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0B7C8C', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#F97316'];

  // Live mode pulls the real tenant summary; mock mode keeps the demo series.
  const { data: liveData, loading: liveLoading, error, mode } = useCollection(
    () => mockAnalytics,
    async (api) => {
      const { toAnalyticsData } = await import('../../lib/api/adapters');
      const res = await api.analytics.summary();
      return res ? toAnalyticsData(res) : mockAnalytics;
    },
    [],
  );

  // Simulated loading shimmer on range change (kept for UX parity with the design).
  useEffect(() => {
    if (dateRange === 'custom' && (!customFrom || !customTo)) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [dateRange, customFrom, customTo]);

  const data = useMemo(
    () => sliceByRange(liveData, dateRange, customFrom, customTo),
    [liveData, dateRange, customFrom, customTo],
  );

  const busy = loading || liveLoading;

  // True when the API answered but the tenant has no chart data yet.
  const noSeriesData =
    mode === 'live' &&
    (data.tickets_over_time?.length ?? 0) === 0 &&
    (data.by_status?.length ?? 0) === 0 &&
    (data.by_priority?.length ?? 0) === 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.analytics.title}</h1>
        <div className="flex items-center gap-3">
          <SegmentedControl
            options={[
              { value: '7d', label: lang === 'fa' ? '۷ روز' : '7 Days' },
              { value: '30d', label: lang === 'fa' ? '۳۰ روز' : '30 Days' },
              { value: 'custom', label: lang === 'fa' ? 'سفارشی' : 'Custom' },
            ]}
            value={dateRange}
            onChange={(v) => setDateRange(v as '7d' | '30d' | 'custom')}
          />
          <span className="text-sm px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-medium">{product.name}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {lang === 'fa' ? 'خطا در دریافت تحلیل‌ها: ' : 'Failed to load analytics: '}
          {error.message}
        </div>
      )}

      {noSeriesData && (
        <Card className="mb-6">
          <EmptyState
            icon={<BarChart3 className="h-8 w-8" />}
            title={lang === 'fa' ? 'داده‌ای برای نمایش نیست' : 'No analytics data yet'}
            description={
              lang === 'fa'
                ? 'به‌محض ثبت تیکت، نمودارها به‌صورت خودکار پر می‌شوند.'
                : 'Charts fill in automatically once tickets are created.'
            }
          />
        </Card>
      )}

      {/* Custom Date Range Inputs */}
      {dateRange === 'custom' && (
        <Card className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {lang === 'fa' ? 'از تاریخ' : 'From Date'}
              </label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {lang === 'fa' ? 'تا تاریخ' : 'To Date'}
              </label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          {(!customFrom || !customTo) && (
            <p className="text-sm text-warning-600 mt-3">
              {lang === 'fa' ? 'لطفاً هر دو تاریخ را انتخاب کنید' : 'Please select both dates'}
            </p>
          )}
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {busy ? (
          <>
            <Card className="h-24"><Skeleton className="h-full w-full" /></Card>
            <Card className="h-24"><Skeleton className="h-full w-full" /></Card>
            <Card className="h-24"><Skeleton className="h-full w-full" /></Card>
            <Card className="h-24"><Skeleton className="h-full w-full" /></Card>
          </>
        ) : (
          <>
            <KPICard label={t.analytics.open_tickets} value={data.kpis.open_tickets} icon={<Inbox className="h-6 w-6" />} color="brand" />
            <KPICard label={t.analytics.unassigned} value={data.kpis.unassigned} icon={<AlertTriangle className="h-6 w-6" />} color="warning" />
            <KPICard label={t.analytics.breached_sla} value={data.kpis.breached_sla} icon={<Clock className="h-6 w-6" />} color="danger" />
            <KPICard label={t.analytics.waiting_customer} value={data.kpis.waiting_customer} icon={<Users className="h-6 w-6" />} color="brand" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {busy ? (
          <>
            <Card className="h-80"><Skeleton className="h-full w-full" /></Card>
            <Card className="h-80"><Skeleton className="h-full w-full" /></Card>
            <Card className="h-80"><Skeleton className="h-full w-full" /></Card>
            <Card className="h-80"><Skeleton className="h-full w-full" /></Card>
          </>
        ) : (
          <>
            {/* Tickets Over Time */}
            <Card>
              <h3 className="font-semibold mb-4">{t.analytics.tickets_over_time}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.tickets_over_time}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="created" name={lang === 'fa' ? 'ایجاد شده' : 'Created'} stroke="#0B7C8C" fill="#0B7C8C" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="resolved" name={lang === 'fa' ? 'حل شده' : 'Resolved'} stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

        {/* By Status */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.by_status}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status}: ${count}`}>
                {data.by_status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* SLA Compliance */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.sla_compliance}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.sla_compliance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="percentage" name={lang === 'fa' ? 'انطباق %' : 'Compliance %'} stroke="#0B7C8C" strokeWidth={2} dot={{ fill: '#0B7C8C' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Agent Workload */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.agent_workload}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.agent_workload} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="agent" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="active" name={lang === 'fa' ? 'تیکت فعال' : 'Active Tickets'} fill="#0B7C8C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Department */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.by_department}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.by_department}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name={lang === 'fa' ? 'تعداد' : 'Count'} fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Priority */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.by_priority}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.by_priority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name={lang === 'fa' ? 'تعداد' : 'Count'} radius={[4, 4, 0, 0]}>
                {data.by_priority.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.priority === 'کم' || entry.priority === 'Low' ? '#10b981' :
                    entry.priority === 'معمولی' || entry.priority === 'Normal' ? '#0B7C8C' :
                    entry.priority === 'بالا' || entry.priority === 'High' ? '#f59e0b' :
                    entry.priority === 'فوری' || entry.priority === 'Urgent' ? '#ef4444' : '#7c2d12'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}
