import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Button, Card, Badge, EmptyState, SearchInput, SegmentedControl } from '../../components/ui';
import { mockSearchResults } from '../../data/mock';
import { useApp } from '../../app/providers';

export default function SearchPage() {
  const { t, lang } = useApp();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('HYBRID');
  const [results, setResults] = useState(mockSearchResults);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query) {
      setResults(mockSearchResults.filter(r => 
        r.title.includes(query) || r.snippet.includes(query)
      ));
    } else {
      setResults(mockSearchResults);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t.search.title}</h1>

      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <SegmentedControl
            options={[
              { value: 'KEYWORD', label: t.search.keyword },
              { value: 'SEMANTIC', label: t.search.semantic },
              { value: 'HYBRID', label: t.search.hybrid }
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchInput 
              value={query} 
              onChange={setQuery} 
              placeholder={t.search.placeholder} 
            />
          </div>
          <Button onClick={handleSearch}>{t.common.search}</Button>
        </div>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-text-muted">
          {t.search.results}: {results.length}
        </p>
        {results.map(r => (
          <div key={r.id} onClick={() => navigate(r.url)} className="cursor-pointer">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={r.type === 'ticket' ? 'info' : r.type === 'article' ? 'brand' : 'success'}>
                    {r.type === 'ticket' ? (lang === 'fa' ? 'تیکت' : 'Ticket') : 
                     r.type === 'article' ? (lang === 'fa' ? 'مقاله' : 'Article') : 
                     (lang === 'fa' ? 'مشتری' : 'Customer')}
                  </Badge>
                  <span className="text-xs text-text-muted">
                    {lang === 'fa' ? 'امتیاز' : 'Score'}: {Math.round(r.score * 100)}%
                  </span>
                </div>
                <h3 className="font-medium mb-1">{r.title}</h3>
                <p className="text-sm text-text-muted">{r.snippet}</p>
              </div>
            </div>
          </Card>
          </div>
        ))}
        {results.length === 0 && <EmptyState title={t.search.no_results} />}
      </div>
    </div>
  );
}
