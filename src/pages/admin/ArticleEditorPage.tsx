import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Eye } from 'lucide-react';
import { Button, Input, Textarea, Select, Card, Badge } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection, describeError } from '../../lib/api/hooks';
import { getDataApi } from '../../lib/api/dataApi';
import { isLiveMode } from '../../lib/api/config';
import { useApp } from '../../app/providers';

export default function ArticleEditorPage() {
  const { kbId, articleId } = useParams();
  const navigate = useNavigate();
  const { lang, showToast } = useApp();

  // Live mode loads from the API; mock mode reads the in-memory store.
  const { data: knowledgeBases, loading: kbLoading } = useCollection(
    () => mockStore.getKnowledgeBases(),
    (api) => api.knowledgeBases.list(),
  );
  const { data: articles, loading: articlesLoading } = useCollection(
    () => mockStore.getArticles(),
    (api) => api.articles.list(),
  );

  const kb = kbId ? knowledgeBases.find(item => item.id === kbId) ?? null : null;
  const article = articleId ? articles.find(item => item.id === articleId) ?? null : null;
  const loading = kbLoading || articlesLoading;

  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [content, setContent] = useState(article?.content || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(article?.status || 'DRAFT');
  const [visibility, setVisibility] = useState<'AGENT' | 'CUSTOMER' | 'BOTH'>(article?.visibility || 'BOTH');
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!articleId && title && !slug) {
      setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [title, slug, articleId]);

  // Live mode resolves the article asynchronously; hydrate the form once.
  const [hydratedArticleId, setHydratedArticleId] = useState<string | null>(null);
  useEffect(() => {
    if (!article || hydratedArticleId === article.id) return;
    setTitle(article.title);
    setSlug(article.slug);
    setContent(article.content);
    setSummary(article.summary || '');
    setStatus(article.status);
    setVisibility(article.visibility);
    setTags(article.tags);
    setHydratedArticleId(article.id);
  }, [article, hydratedArticleId]);

  if (!kb) {
    if (loading) return null;
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">
            {lang === 'fa' ? 'پایگاه دانش یافت نشد' : 'Knowledge base not found'}
          </p>
          <Button variant="secondary" onClick={() => navigate('/admin/knowledge-bases')} className="mt-4">
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      showToast(lang === 'fa' ? 'لطفاً عنوان را وارد کنید' : 'Please enter a title', 'error');
      return;
    }

    if (!content.trim()) {
      showToast(lang === 'fa' ? 'لطفاً محتوا را وارد کنید' : 'Please enter content', 'error');
      return;
    }

    const articleData = {
      kb_id: kbId!,
      title,
      slug,
      content,
      summary: summary || undefined,
      status,
      visibility,
      tags,
    };

    if (isLiveMode()) {
      try {
        if (articleId && article) {
          await getDataApi().articles.update(articleId, articleData);
          showToast(lang === 'fa' ? 'مقاله بروزرسانی شد' : 'Article updated', 'success');
        } else {
          await getDataApi().articles.create(articleData);
          showToast(lang === 'fa' ? 'مقاله ایجاد شد' : 'Article created', 'success');
        }
        navigate(`/admin/knowledge-bases/${kbId}/articles`);
      } catch (error) {
        showToast(describeError(error as Error) ?? 'Save failed', 'error');
      }
      return;
    }

    if (articleId && article) {
      mockStore.updateArticle(articleId, articleData);
      showToast(lang === 'fa' ? 'مقاله بروزرسانی شد' : 'Article updated', 'success');
    } else {
      mockStore.createArticle(articleData);
      showToast(lang === 'fa' ? 'مقاله ایجاد شد' : 'Article created', 'success');
    }

    navigate(`/admin/knowledge-bases/${kbId}/articles`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <button onClick={() => navigate('/admin/knowledge-bases')} className="hover:text-brand-600">
          {lang === 'fa' ? 'پایگاه‌های دانش' : 'Knowledge Bases'}
        </button>
        <span>/</span>
        <button onClick={() => navigate(`/admin/knowledge-bases/${kbId}/articles`)} className="hover:text-brand-600">
          {kb.name}
        </button>
        <span>/</span>
        <span className="text-text">
          {articleId 
            ? (lang === 'fa' ? 'ویرایش مقاله' : 'Edit Article')
            : (lang === 'fa' ? 'مقاله جدید' : 'New Article')}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/admin/knowledge-bases/${kbId}/articles`)} className="p-1 rounded hover:bg-surface-hover">
            <ChevronLeft className="h-5 w-5 flip-rtl" />
          </button>
          <h1 className="text-2xl font-bold">
            {articleId 
              ? (lang === 'fa' ? 'ویرایش مقاله' : 'Edit Article')
              : (lang === 'fa' ? 'مقاله جدید' : 'New Article')}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4" />
            {showPreview ? (lang === 'fa' ? 'ویرایش' : 'Edit') : (lang === 'fa' ? 'پیش‌نمایش' : 'Preview')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            {lang === 'fa' ? 'ذخیره' : 'Save'}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <Card>
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">{title || (lang === 'fa' ? 'بدون عنوان' : 'Untitled')}</h2>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={status === 'PUBLISHED' ? 'success' : status === 'DRAFT' ? 'warning' : 'default'}>
                {status === 'PUBLISHED' ? (lang === 'fa' ? 'منتشر شده' : 'Published') : 
                 status === 'DRAFT' ? (lang === 'fa' ? 'پیش‌نویس' : 'Draft') : 
                 (lang === 'fa' ? 'آرشیو' : 'Archived')}
              </Badge>
              <Badge variant="info">
                {visibility === 'BOTH' ? (lang === 'fa' ? 'عمومی' : 'Public') : 
                 visibility === 'AGENT' ? (lang === 'fa' ? 'کارشناس' : 'Agent') : 
                 (lang === 'fa' ? 'مشتری' : 'Customer')}
              </Badge>
              {tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
            </div>
          </div>
          {summary && (
            <div className="mb-6 p-4 bg-brand-50 rounded-lg border border-brand-200">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-brand-700)' }}>
                {lang === 'fa' ? 'خلاصه' : 'Summary'}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {summary}
              </p>
            </div>
          )}
          <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text)' }}>
            <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <Input
                label={lang === 'fa' ? 'عنوان' : 'Title'}
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder={lang === 'fa' ? 'عنوان مقاله' : 'Article title'}
                required
              />
              <Input
                label={lang === 'fa' ? 'نامک' : 'Slug'}
                value={slug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                placeholder="article-slug"
              />
              <Textarea
                label={lang === 'fa' ? 'خلاصه' : 'Summary'}
                value={summary}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSummary(e.target.value)}
                placeholder={lang === 'fa' ? 'خلاصه کوتاه مقاله (اختیاری)' : 'Brief summary (optional)'}
                rows={2}
              />
            </div>
          </Card>

          <Card>
            <label className="block text-sm font-medium mb-2">
              {lang === 'fa' ? 'محتوا' : 'Content'}
              <span className="text-text-muted text-xs mr-2">
                ({lang === 'fa' ? 'از Markdown پشتیبانی می‌شود' : 'Markdown supported'})
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={lang === 'fa' ? 'محتوای مقاله را بنویسید...' : 'Write article content...'}
              className="w-full h-96 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-sm"
            />
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label={lang === 'fa' ? 'وضعیت' : 'Status'}
                value={status}
                onChange={(v) => setStatus(v as any)}
                options={[
                  { value: 'DRAFT', label: lang === 'fa' ? 'پیش‌نویس' : 'Draft' },
                  { value: 'PUBLISHED', label: lang === 'fa' ? 'منتشر شده' : 'Published' },
                  { value: 'ARCHIVED', label: lang === 'fa' ? 'آرشیو' : 'Archived' },
                ]}
              />
              <Select
                label={lang === 'fa' ? 'قابلیت مشاهده' : 'Visibility'}
                value={visibility}
                onChange={(v) => setVisibility(v as any)}
                options={[
                  { value: 'BOTH', label: lang === 'fa' ? 'عمومی (کارشناس و مشتری)' : 'Public (Agent & Customer)' },
                  { value: 'AGENT', label: lang === 'fa' ? 'فقط کارشناس' : 'Agent Only' },
                  { value: 'CUSTOMER', label: lang === 'fa' ? 'فقط مشتری' : 'Customer Only' },
                ]}
              />
            </div>
          </Card>

          <Card>
            <Input
              label={lang === 'fa' ? 'برچسب‌ها' : 'Tags'}
              value={tags.join(', ')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newTags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                setTags(newTags);
              }}
              placeholder={lang === 'fa' ? 'برچسب‌ها را با کاما جدا کنید' : 'Separate tags with commas'}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="default">
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                      className="mr-1 hover:text-danger-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
