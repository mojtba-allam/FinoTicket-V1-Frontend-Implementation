import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit, Eye, BookOpen } from 'lucide-react';
import { Button, Card, Badge, EmptyState, SearchInput } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection } from '../../lib/api/hooks';
import { useApp } from '../../app/providers';

export default function KBArticlesListPage() {
  const { kbId } = useParams();
  const navigate = useNavigate();
  const { lang } = useApp();

  const [search, setSearch] = useState('');

  // Live mode loads from the API; mock mode reads the in-memory store.
  const { data: knowledgeBases, loading: kbLoading } = useCollection(
    () => mockStore.getKnowledgeBases(),
    (api) => api.knowledgeBases.list(),
  );
  const { data: allArticles, loading: articlesLoading } = useCollection(
    () => mockStore.getArticles(),
    (api) => api.articles.list(),
  );

  const kb = kbId ? knowledgeBases.find(item => item.id === kbId) ?? null : null;
  const articles = kbId ? allArticles.filter(article => article.kb_id === kbId) : [];
  const loading = kbLoading || articlesLoading;

  const filteredArticles = articles.filter(article =>
    !search || 
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.content.toLowerCase().includes(search.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  if (!kb) {
    // In live mode the collection may still be loading; keep the same
    // "not found" surface, which simply renders until the data arrives.
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">
            {loading
              ? (lang === 'fa' ? 'در حال بارگذاری...' : 'Loading...')
              : (lang === 'fa' ? 'پایگاه دانش یافت نشد' : 'Knowledge base not found')}
          </p>
          {!loading && (
            <Button variant="secondary" onClick={() => navigate('/admin/knowledge-bases')} className="mt-4">
              {lang === 'fa' ? 'بازگشت' : 'Back'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <button onClick={() => navigate('/admin/knowledge-bases')} className="hover:text-brand-600">
          {lang === 'fa' ? 'پایگاه‌های دانش' : 'Knowledge Bases'}
        </button>
        <span>/</span>
        <span className="text-text">{kb.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/knowledge-bases')} className="p-1 rounded hover:bg-surface-hover">
            <ChevronLeft className="h-5 w-5 flip-rtl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{kb.name}</h1>
            <p className="text-sm text-text-muted">
              {kb.scope} • {articles.length} {lang === 'fa' ? 'مقاله' : 'articles'}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/knowledge-bases/${kbId}/articles/new`)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'مقاله جدید' : 'New Article'}
        </Button>
      </div>

      <Card className="mb-6 !p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={lang === 'fa' ? 'جستجو در مقالات...' : 'Search articles...'}
        />
      </Card>

      {filteredArticles.length === 0 && !loading ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'مقاله‌ای یافت نشد' : 'No articles found'}
          description={search
            ? (lang === 'fa' ? 'جستجوی دیگری امتحان کنید' : 'Try a different search')
            : (lang === 'fa' ? 'اولین مقاله را ایجاد کنید' : 'Create your first article')}
          action={!search && (
            <Button onClick={() => navigate(`/admin/knowledge-bases/${kbId}/articles/new`)}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد مقاله' : 'Create Article'}
            </Button>
          )}
        />
      ) : (
        <div className="space-y-3">
          {filteredArticles.map(article => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{article.title}</h3>
                  <p className="text-xs text-text-muted font-mono">{article.slug}</p>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
              </div>
              {article.summary && (
                <p className="text-sm text-text-muted mb-2">{article.summary}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {article.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="default">+{article.tags.length - 3}</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/desk/knowledge/articles/${article.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    {lang === 'fa' ? 'مشاهده' : 'View'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/knowledge-bases/${kbId}/articles/${article.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    {lang === 'fa' ? 'ویرایش' : 'Edit'}
                  </Button>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-border text-xs text-text-muted">
                {lang === 'fa' ? 'آخرین بروزرسانی:' : 'Last updated:'}{' '}
                {new Date(article.updated_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
