import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket as TicketIcon, Shield, Building2, UserCheck, Eye } from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { fa } from '../../i18n';
import { useApp } from '../../app/providers';
import { mockStore } from '../../lib/api/mockStore';
import { DEMO_CLIENT } from '../../lib/api/config';
import { ApiError } from '../../lib/api/http';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, session } = useApp();
  const [email, setEmail] = useState('admin@finoticket.ir');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** Live mode: exchange the demo client credentials for a bearer token. */
  const loginLive = async (consoleType: 'platform' | 'tenant', displayName: string) => {
    const loggedIn = await session.login({
      clientId: DEMO_CLIENT.clientId,
      clientSecret: DEMO_CLIENT.clientSecret,
      console: consoleType,
      displayName,
      email,
    });

    navigate(loggedIn.console === 'platform' ? '/platform' : '/desk');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError(fa.auth.invalid_credentials);
        return;
      }

      if (session.isLive) {
        const consoleType = email.startsWith('super') ? 'platform' : 'tenant';
        await loginLive(consoleType, email);
        return;
      }

      // Mock mode: look the user up in the in-memory store.
      const user = mockStore.getUserByEmail(email);

      if (!user) {
        setError(fa.auth.invalid_credentials);
        return;
      }

      if (user.status === 'SUSPENDED') {
        setError(fa.auth.invalid_credentials);
        return;
      }

      setUser(user);
      navigate(user.console === 'platform' ? '/platform' : '/desk');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || fa.auth.invalid_credentials);
      } else {
        setError(fa.auth.invalid_credentials);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setError('');
    setLoading(true);
    setEmail(email);

    try {
      if (session.isLive) {
        const consoleType = email.startsWith('super') ? 'platform' : 'tenant';
        await loginLive(consoleType, email);
        return;
      }

      const user = mockStore.getUserByEmail(email);
      if (user) {
        setUser(user);
        navigate(user.console === 'platform' ? '/platform' : '/desk');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : fa.auth.invalid_credentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-mesh)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'var(--gradient-hero)' }}>
            <TicketIcon className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-brand-800)' }}>{fa.app.name}</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{fa.app.tagline}</p>
        </div>
        <Card className="!p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="bg-danger-50 border border-red-200 rounded-lg p-3 text-sm text-danger-600">{error}</div>}
            <Input label={fa.auth.email} type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            <Input label={fa.auth.password} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><span className="animate-spin">⏳</span> {fa.common.loading}</> : fa.auth.login_button}
            </Button>
            <p className="text-center text-xs text-text-muted">
              <Link to="/forgot-password" className="text-brand-600 hover:underline">{fa.auth.forgot_password}</Link>
            </p>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center mb-3">
              حساب‌های آزمایشی / Demo Accounts
            </p>
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleQuickLogin('super@fino.local')}
                disabled={loading}
              >
                <Shield className="h-4 w-4" />
                سوپر ادمین / Super Admin
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleQuickLogin('owner@finoticket.ir')}
                disabled={loading}
              >
                <Shield className="h-4 w-4" />
                مالک / Owner
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleQuickLogin('admin@finoticket.ir')}
                disabled={loading}
              >
                <Building2 className="h-4 w-4" />
                ادمین / Admin
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleQuickLogin('manager@finoticket.ir')}
                disabled={loading}
              >
                <UserCheck className="h-4 w-4" />
                مدیر ارشد / Manager
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleQuickLogin('agent@finoticket.ir')}
                disabled={loading}
              >
                <UserCheck className="h-4 w-4" />
                کارشناس / Agent
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleQuickLogin('viewer@finoticket.ir')}
                disabled={loading}
              >
                <Eye className="h-4 w-4" />
                مشاهده‌کننده / Viewer
              </Button>
            </div>
          </div>
        </Card>
        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>نسخه ۱.۰ — FinoTicket © 2024</p>
      </div>
    </div>
  );
}
