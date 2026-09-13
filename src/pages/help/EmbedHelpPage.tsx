import React, { useMemo, useState } from 'react';
import { Copy, Check, Code2, ShieldCheck, AlertTriangle, MessageSquare, Palette, Server } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { useApp } from '../../app/providers';

/**
 * In-app integration guide for the embeddable console (L11).
 *
 * Mirrors `FinoTicket-V1-Backend/docs/agent-embed.md`, but every snippet is
 * pre-filled with the operator's OWN origin and API base so it can be copied
 * straight into their site without editing.
 *
 * Visible to OWNER/ADMIN only — see the sidebar entry in DeskLayout.
 */

type Tab = 'quickstart' | 'handshake' | 'theming' | 'messages' | 'troubleshoot';

const CN = {
  fa: {
    title: 'راهنمای جاسازی پنل کارشناسان',
    intro:
      'این راهنما برای تیم فنی شماست: با یک تگ اسکریپت و یک المان، پنل کامل کارشناسان داخل سایت خودتان بالا می‌آید — بدون iframe و بدون نیاز به طراحی رابط کاربری.',
    tabs: {
      quickstart: 'شروع سریع',
      handshake: 'احراز هویت',
      theming: 'ظاهر و رنگ',
      messages: 'پیام‌ها',
      troubleshoot: 'عیب‌یابی',
    },
    copy: 'کپی',
    copied: 'کپی شد',
    yourOrigin: 'دامنه‌ی شما',
    yourOriginHint: 'این مقدار از آدرس فعلی مرورگر شما خوانده شده است.',
    step1: 'قدم ۱ — یک کلاینت API بسازید',
    step1Body:
      'به «مدیریت ← کلاینت‌های API» بروید و یک کلاینت با دسترسی‌های لازم بسازید. سکرت فقط یک بار نمایش داده می‌شود؛ آن را در سرور خودتان نگه دارید.',
    scopesTitle: 'کدام دسترسی لازم است؟',
    scopeRows: [
      ['فقط تیکت‌ها', 'tickets:read · tickets:write'],
      ['به‌همراه مشتریان', 'customers:read · customers:write'],
      ['به‌همراه صفحات مدیریت', 'events:write'],
      ['فقط گزارش‌گیری', 'tickets:read'],
    ],
    step2: 'قدم ۲ — دامنه‌ی خود را مجاز کنید',
    step2Body:
      'در همان فرم، «دامنه‌های مجاز» را روی دامنه‌ی دقیق خودتان تنظیم کنید. بدون این کار، مرورگر شما رد می‌شود.',
    step3: 'قدم ۳ — کد را در سایت خود بگذارید',
    snippetTitle: 'کد کامل',
    handshakeTitle: 'روند احراز هویت',
    handshakeBody:
      'توکن هرگز داخل آدرس صفحه نمی‌رود. سرور شما با اطلاعات محرمانه‌ی خود یک توکن کوتاه‌عمر می‌گیرد و فقط همان را به پنل می‌دهد.',
    serverSide: 'سمت سرور (نمونه)',
    browserSide: 'سمت مرورگر',
    themeTitle: 'رنگ و فونت خودتان',
    themeBody:
      'کافی است چند متغیر CSS بدهید. استایل‌های عادی سایت شما به داخل پنل نفوذ نمی‌کند و برعکس.',
    messagesTitle: 'پیام‌هایی که رد و بدل می‌شود',
    hostToEmbed: 'از سایت شما به پنل',
    embedToHost: 'از پنل به سایت شما',
    troubleshootTitle: 'مشکلات رایج و راه‌حل',
    securityTitle: 'نکات امنیتی',
    securityPoints: [
      'توکن فقط با پیام امن منتقل می‌شود، نه در آدرس صفحه.',
      'توکن در حافظه‌ی مرورگر ذخیره نمی‌شود؛ با بستن صفحه تمام می‌شود.',
      'دسترسی‌ها محدود می‌شوند: توکن نمی‌تواند بیشتر از خود کلاینت اجازه داشته باشد.',
      'عمر توکن کوتاه است (به‌صورت پیش‌فرض حداکثر یک ساعت).',
      'سکرت کلاینت فقط باید روی سرور شما باشد، نه در مرورگر.',
    ],
  },
  en: {
    title: 'Agent Console Embedding Guide',
    intro:
      'For your engineering team: one script tag and one element put the full agent console inside your own site — no iframe, and no UI to build.',
    tabs: {
      quickstart: 'Quick start',
      handshake: 'Authentication',
      theming: 'Theming',
      messages: 'Messages',
      troubleshoot: 'Troubleshooting',
    },
    copy: 'Copy',
    copied: 'Copied',
    yourOrigin: 'Your origin',
    yourOriginHint: 'Read from the current browser URL.',
    step1: 'Step 1 — create an API client',
    step1Body:
      'Go to Admin → API Clients and create a client with the scopes you need. The secret is shown once; keep it on your server.',
    scopesTitle: 'Which scopes do you need?',
    scopeRows: [
      ['Tickets only', 'tickets:read · tickets:write'],
      ['Plus customers', 'customers:read · customers:write'],
      ['Plus admin pages', 'events:write'],
      ['Reporting only', 'tickets:read'],
    ],
    step2: 'Step 2 — allow your origin',
    step2Body:
      'In the same form, set allowed origins to your exact origin. Without it, your browser is rejected.',
    step3: 'Step 3 — drop the code into your site',
    snippetTitle: 'Full snippet',
    handshakeTitle: 'How authentication works',
    handshakeBody:
      'The token never travels in a URL. Your server mints a short-lived token with your secret and hands only that to the console.',
    serverSide: 'Server side (example)',
    browserSide: 'Browser side',
    themeTitle: 'Your colours and font',
    themeBody:
      'Set a few CSS variables. Your ordinary page CSS cannot reach the console, and vice versa.',
    messagesTitle: 'Messages exchanged',
    hostToEmbed: 'Your page → the console',
    embedToHost: 'The console → your page',
    troubleshootTitle: 'Common problems',
    securityTitle: 'Security notes',
    securityPoints: [
      'The token is passed by postMessage, never in a URL.',
      'The token is not persisted; closing the page ends the session.',
      'Scopes are clamped — a token can never exceed its client.',
      'Tokens are short-lived (one hour maximum by default).',
      'The client secret must live on your server, never in a browser.',
    ],
  },
};

const SCOPE_TABLE_FA = CN.fa.scopeRows;
const SCOPE_TABLE_EN = CN.en.scopeRows;

const HOST_MESSAGES = [
  ['fino:init', '{ token, expiresIn?, scopes? }', 'یک نشست را بپذیرید / adopt a session'],
  ['fino:token', '{ token, expiresIn? }', 'توکن را تازه کنید / rotate the token'],
  ['fino:logout', '—', 'خروج / end the session'],
  ['fino:navigate', '{ path }', 'رفتن به یک صفحه / open a route'],
  ['fino:theme', '{ primary?, radius? }', 'تغییر ظاهر / re-theme'],
];

const EMBED_MESSAGES = [
  ['fino:ready', '{ authenticated, version }', 'آماده‌ی دریافت پیام / mounted'],
  ['fino:auth-required', '—', 'توکن بفرستید / send a token'],
  ['fino:resize', '{ height }', 'ارتفاع را اعمال کنید / apply this height'],
  ['fino:navigate', '{ path }', 'کاربر جابه‌جا شد / the agent navigated'],
  ['fino:toast', '{ level, message }', 'پیام را نشان دهید / surface a message'],
  ['fino:error', '{ code, message }', 'خطای جدی / something is wrong'],
];

const TROUBLESHOOT = [
  ['پنل خالی است، هیچ درخواستی نمی‌رود', 'Blank panel, no requests', 'allowed-origins اشتباه است / allow-list mismatch'],
  ['403 از سرور', '403 from the API', 'دامنه در لیست مجاز نیست / origin not allow-listed'],
  ['401 از سرور', '401 from the API', 'توکن منقضی یا ارسال نشده / token missing or expired'],
  ['اسکرول تودرتو', 'Nested scrollbar', 'fino:resize اعمال نشده / resize not applied'],
  ['صفحه‌ی ۴۰۴', 'A 404 page', 'start-path برای این نقش مجاز نیست / route not allowed for this role'],
];

function Snippet({
  code,
  lang,
  label,
}: {
  code: string;
  lang: 'fa' | 'en';
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = CN[lang];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the code is still selectable by hand.
    }
  };

  return (
    <div className="relative">
      {label && <p className="text-xs font-medium text-text-muted mb-2">{label}</p>}
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? t.copied : t.copy}
      </button>
      <pre
        dir="ltr"
        className="rounded-lg bg-slate-900 p-4 pt-11 text-left text-xs leading-relaxed text-slate-100 overflow-x-auto"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function EmbedHelpPage() {
  const { lang } = useApp();
  const t = CN[lang];
  const [tab, setTab] = useState<Tab>('quickstart');

  // Pre-personalise every snippet with the operator's real origin.
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-site.example';
  const apiBase = typeof window !== 'undefined' ? window.location.origin : 'https://api.finoticket.ir';

  const quickstart = useMemo(
    () => `<script src="https://cdn.finoticket.ir/fino-console.js"></script>

<fino-console
  mode="agent"
  api-base="${apiBase}"
  allowed-origins="${origin}"
  locale="${lang}"
  primary-color="#2563eb"
  style="display:block; width:100%; height:700px"
></fino-console>`,
    [apiBase, origin, lang],
  );

  const serverSnippet = `// POST /api/finoticket-token  (your server)
app.post('/api/finoticket-token', async (req, res) => {
  // 1. Your own auth: may this agent use the console?
  if (!req.session.agentId) return res.sendStatus(401);

  // 2. Swap YOUR credentials for a short-lived, narrow token.
  const client = await fetch(\`\${process.env.FINO_API}/api/v1/auth/token\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.FINO_CLIENT_ID,
      client_secret: process.env.FINO_CLIENT_SECRET,
    }),
  }).then((r) => r.json());

  const embed = await fetch(\`\${process.env.FINO_API}/api/v1/auth/embed-exchange\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${client.access_token}\`,
    },
    body: JSON.stringify({
      console: 'tenant',
      scopes: ['tickets:read', 'tickets:write'],   // minimum you need
      ttl: 3600,                                   // clamped by the API
    }),
  }).then((r) => r.json());

  res.json({ access_token: embed.access_token, expires_in: embed.expires_in });
});`;

  const browserSnippet = `const el = document.querySelector('fino-console');

async function handOverToken() {
  const { access_token, expires_in } = await fetch('/api/finoticket-token', {
    method: 'POST',
  }).then((r) => r.json());

  el.setToken(access_token, { expiresIn: expires_in });
}

// The console asks for a token…
el.addEventListener('fino:auth-required', handOverToken);

// …and tells us how tall it is, so we can size it.
window.addEventListener('message', (e) => {
  if (e.data?.type === 'fino:resize') {
    el.style.height = \`\${e.data.height}px\`;
  }
});`;

  const themeSnippet = `fino-console {
  --fino-primary: #0f766e;
  --fino-primary-fg: #ffffff;
  --fino-radius: 12px;
  --fino-font: 'Vazirmatn', system-ui, sans-serif;
  --fino-surface: #ffffff;
  --fino-text: #111827;
  --fino-border: #e5e7eb;
}`;

  const scopeTable = lang === 'fa' ? SCOPE_TABLE_FA : SCOPE_TABLE_EN;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Code2 className="h-6 w-6 text-brand-500" />
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">{t.intro}</p>
      </div>

      {/* Origin banner — the value every snippet is built from */}
      <Card className="mb-6 !p-4 bg-brand-50/50 border-brand-200">
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium mb-1">{t.yourOrigin}</p>
            <code dir="ltr" className="text-xs bg-white rounded px-2 py-1 border border-brand-200 block truncate">
              {origin}
            </code>
            <p className="text-xs text-text-muted mt-2">{t.yourOriginHint}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(t.tabs) as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              tab === key
                ? 'bg-brand-500 text-white font-medium'
                : 'bg-surface-alt text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {t.tabs[key]}
          </button>
        ))}
      </div>

      {tab === 'quickstart' && (
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold mb-2">{t.step1}</h2>
            <p className="text-sm text-text-muted mb-4">{t.step1Body}</p>
            <p className="text-sm font-medium mb-3">{t.scopesTitle}</p>
            <div className="space-y-2">
              {scopeTable.map(([what, scopes]) => (
                <div key={what} className="flex items-center justify-between gap-4 text-sm border-b border-border pb-2 last:border-0">
                  <span>{what}</span>
                  <code dir="ltr" className="text-xs bg-surface-alt rounded px-2 py-1">{scopes}</code>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold mb-2">{t.step2}</h2>
            <p className="text-sm text-text-muted mb-3">{t.step2Body}</p>
            <code dir="ltr" className="text-xs bg-slate-900 text-emerald-300 rounded px-3 py-2 block">
              allowed-origins="{origin}"
            </code>
          </Card>

          <Card>
            <h2 className="font-semibold mb-3">{t.step3}</h2>
            <Snippet code={quickstart} lang={lang} label={t.snippetTitle} />
          </Card>
        </div>
      )}

      {tab === 'handshake' && (
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold mb-2">{t.handshakeTitle}</h2>
            <p className="text-sm text-text-muted">{t.handshakeBody}</p>
          </Card>
          <Card>
            <Snippet code={serverSnippet} lang={lang} label={t.serverSide} />
          </Card>
          <Card>
            <Snippet code={browserSnippet} lang={lang} label={t.browserSide} />
          </Card>
        </div>
      )}

      {tab === 'theming' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-brand-500" />
              <h2 className="font-semibold">{t.themeTitle}</h2>
            </div>
            <p className="text-sm text-text-muted mb-4">{t.themeBody}</p>
            <Snippet code={themeSnippet} lang={lang} />
          </Card>
        </div>
      )}

      {tab === 'messages' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              <h2 className="font-semibold">{t.hostToEmbed}</h2>
            </div>
            <div className="space-y-2">
              {HOST_MESSAGES.map(([type, payload, meaning]) => (
                <div key={type} className="text-sm border-b border-border pb-2 last:border-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default">{type}</Badge>
                    <code dir="ltr" className="text-xs text-text-muted">{payload}</code>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{meaning}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              <h2 className="font-semibold">{t.embedToHost}</h2>
            </div>
            <div className="space-y-2">
              {EMBED_MESSAGES.map(([type, payload, meaning]) => (
                <div key={type} className="text-sm border-b border-border pb-2 last:border-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default">{type}</Badge>
                    <code dir="ltr" className="text-xs text-text-muted">{payload}</code>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{meaning}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'troubleshoot' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
              <h2 className="font-semibold">{t.troubleshootTitle}</h2>
            </div>
            <div className="space-y-3">
              {TROUBLESHOOT.map(([fa, en, fix]) => (
                <div key={en} className="border-b border-border pb-3 last:border-0">
                  <p className="text-sm font-medium">{lang === 'fa' ? fa : en}</p>
                  <p className="text-xs text-text-muted mt-1">{fix}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-success-500/30 bg-success-50/40">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-success-600" />
              <h2 className="font-semibold">{t.securityTitle}</h2>
            </div>
            <ul className="space-y-2">
              {t.securityPoints.map((point) => (
                <li key={point} className="text-sm flex items-start gap-2">
                  <Check className="h-4 w-4 text-success-600 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
