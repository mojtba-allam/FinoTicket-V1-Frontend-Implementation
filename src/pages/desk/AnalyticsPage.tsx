import React from 'react';
import { BarChart3, Inbox, AlertTriangle, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, KPICard } from '../../components/ui';
import { mockAnalytics } from '../../data/mock';
import { useApp } from '../../app/providers';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export default function AnalyticsPage() {
  const { t, product, lang } = useApp();
  const data = mockAnalytics;
  const COLORS = ['#0B7C8C', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#F97316'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.analytics.title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-medium">{product.name}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label={t.analytics.open_tickets} value={data.kpis.open_tickets} icon={<Inbox className="h-6 w-6" />} color="brand" />
        <KPICard label={t.analytics.unassigned} value={data.kpis.unassigned} icon={<AlertTriangle className="h-6 w-6" />} color="warning" />
        <KPICard label={t.analytics.breached_sla} value={data.kpis.breached_sla} icon={<Clock className="h-6 w-6" />} color="danger" />
        <KPICard label={t.analytics.waiting_customer} value={data.kpis.waiting_customer} icon={<Users className="h-6 w-6" />} color="brand" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}
