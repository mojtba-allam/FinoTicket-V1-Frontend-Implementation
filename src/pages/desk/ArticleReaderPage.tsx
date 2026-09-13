import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Card, Badge, ErrorState } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection } from '../../lib/api/hooks';
import { useApp } from '../../app/providers';

export default function ArticleReaderPage() {
  const { id } = useParams();
  const { t, lang } = useApp();
  const navigate = useNavigate();

  // Live mode loads from the API; mock mode reads the in-memory store.
  const { data: articles, loading: articlesLoading } = useCollection(
    () => mockStore.getArticles(),
    (api) => api.articles.list(),
  );
  const { data: knowledgeBases, loading: kbLoading } = useCollection(
    () => mockStore.getKnowledgeBases(),
    (api) => api.knowledgeBases.list(),
  );

  const article = id ? articles.find(item => item.id === id) ?? null : null;
  const loading = articlesLoading || kbLoading;

  // Keep loading: a live fetch may not have resolved yet, so don't flash "not found".
  if (!article) {
    if (loading) return null;
    return <div className="p-6"><ErrorState title={lang === 'fa' ? 'مقاله یافت نشد' : 'Article not found'} /></div>;
  }

  const kb = knowledgeBases.find(item => item.id === article.kb_id);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-surface-hover">
          <ChevronLeft className="h-5 w-5 flip-rtl" />
        </button>
        <div>
          <p className="text-xs text-text-muted">{kb?.name}</p>
          <h1 className="text-2xl font-bold">{article.title}</h1>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <Badge variant={article.status === 'PUBLISHED' ? 'success' : article.status === 'DRAFT' ? 'warning' : 'default'}>
            {article.status === 'PUBLISHED' ? (lang === 'fa' ? 'منتشر شده' : 'Published') : 
             article.status === 'DRAFT' ? (lang === 'fa' ? 'پیش‌نویس' : 'Draft') : 
             (lang === 'fa' ? 'آرشیو' : 'Archived')}
          </Badge>
          <Badge variant="info">
            {article.visibility === 'BOTH' ? (lang === 'fa' ? 'عمومی' : 'Public') : 
             article.visibility === 'AGENT' ? (lang === 'fa' ? 'کارشناس' : 'Agent') : 
             (lang === 'fa' ? 'مشتری' : 'Customer')}
          </Badge>
          <div className="flex gap-1">
            {article.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
          </div>
        </div>

        {article.summary && (
          <div className="mb-6 p-4 bg-brand-50 rounded-lg border border-brand-200">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-brand-700)' }}>
              {lang === 'fa' ? 'خلاصه' : 'Summary'}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {article.summary}
            </p>
          </div>
        )}

        <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text)' }}>
          <div className="whitespace-pre-wrap leading-relaxed">{article.content}</div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-xs text-text-muted">
          <p>
            {lang === 'fa' ? 'آخرین بروزرسانی:' : 'Last updated:'}{' '}
            {new Date(article.updated_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
          </p>
        </div>
      </Card>
    </div>
  );
}
