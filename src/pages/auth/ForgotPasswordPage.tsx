import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket as TicketIcon, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { fa } from '../../i18n';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-mesh)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-hero)' }}>
            <TicketIcon className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-brand-800)' }}>بازیابی رمز عبور</h1>
        </div>
        <Card className="!p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-success-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">ایمیل ارسال شد</h3>
              <p className="text-sm text-text-muted mb-4">لینک بازیابی به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.</p>
              <Link to="/login"><Button variant="secondary">بازگشت به ورود</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="ایمیل" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="email@example.com" required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
              </Button>
              <p className="text-center text-xs text-text-muted">
                <Link to="/login" className="text-brand-600 hover:underline">بازگشت به ورود</Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
