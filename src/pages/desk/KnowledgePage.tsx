import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, SearchInput, EmptyState } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useCollection } from '../../lib/api/hooks';
import { useApp } from '../../app/providers';

export default function KnowledgePage() {
  const { t, lang } = useApp();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  useMockStore();

  const { data: knowledgeBases } = useCollection(
    () => mockStore.getKnowledgeBases(),
    (api) => api.knowledgeBases.list(),
  );

  // Only published articles are shown to agents in the reader.
  const { data: allArticles, loading } = useCollection(
    () => mockStore.getPublishedArticles(),
    (api) => api.articles.list(),
  );

  const publishedArticles = allArticles.filter(a => a.status === 'PUBLISHED');

  const filtered = publishedArticles.filter(a => 
    !search || 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase()) ||
    a.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.knowledge}</h1>
      </div>

      <Card className="mb-6 !p-4">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder={lang === 'fa' ? 'جستجو در مقالات...' : 'Search articles...'} 
        />
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* KB List */}
        <div>
          <h2 className="font-semibold mb-3">
            {lang === 'fa' ? 'پایگاه‌های دانش' : 'Knowledge Bases'}
          </h2>
          <div className="space-y-3">
            {knowledgeBases.map((kb: any) => (
              <Card key={kb.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{kb.name}</h3>
                    <p className="text-xs text-text-muted">
                      {kb.scope} • {kb.articles_count} {lang === 'fa' ? 'مقاله' : 'articles'}
                    </p>
                  </div>
                  <Badge variant={kb.status === 'ACTIVE' ? 'success' : 'default'}>
                    {kb.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 className="font-semibold mb-3">{lang === 'fa' ? 'مقالات' : 'Articles'}</h2>
          <div className="space-y-3">
            {filtered.map(article => (
              <div key={article.id} onClick={() => navigate(`/desk/knowledge/articles/${article.id}`)}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{article.title}</h3>
                    <Badge variant={article.status === 'PUBLISHED' ? 'success' : article.status === 'DRAFT' ? 'warning' : 'default'}>
                      {article.status === 'PUBLISHED' ? (lang === 'fa' ? 'منتشر شده' : 'Published') : 
                       article.status === 'DRAFT' ? (lang === 'fa' ? 'پیش‌نویس' : 'Draft') : 
                       (lang === 'fa' ? 'آرشیو' : 'Archived')}
                    </Badge>
                  </div>
                  {article.summary && <p className="text-sm text-text-muted mb-2">{article.summary}</p>}
                  <div className="flex items-center gap-2">
                    <Badge variant="info">
                      {article.visibility === 'BOTH' ? (lang === 'fa' ? 'عمومی' : 'Public') : 
                       article.visibility === 'AGENT' ? (lang === 'fa' ? 'کارشناس' : 'Agent') : 
                       (lang === 'fa' ? 'مشتری' : 'Customer')}
                    </Badge>
                    {article.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                </Card>
              </div>
            ))}
            {filtered.length === 0 && !loading && <EmptyState title={t.common.empty} />}
          </div>
        </div>
      </div>
    </div>
  );
}
