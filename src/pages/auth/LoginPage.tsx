import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket as TicketIcon } from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { fa } from '../../i18n';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@finoticket.ir');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email && password) navigate('/desk');
      else setError(fa.auth.invalid_credentials);
      setLoading(false);
    }, 800);
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
        </Card>
        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>نسخه ۱.۰ — FinoTicket © 2024</p>
      </div>
    </div>
  );
}
