'use client';

import { useEffect, useRef, useState } from 'react';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import WeakTopicItem from '@/components/dashboard/WeakTopicItem';

export default function WeakTopicsPage() {
  const [topics, setTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDocId, setFilterDocId] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  useEffect(() => {
    weakTopicsApi.getAll().then(res => {
      if (res.data) setTopics(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handleResolved(updated: WeakTopic) {
    setTopics(prev => prev.map(t => t.id === updated.id ? updated : t));
  }

  const documents = Array.from(new Map(
    topics.filter(t => t.document).map(t => [t.documentId, t.document!])
  ).entries()).map(([id, doc]) => ({ id, title: doc.title }));

  const filtered = topics.filter(t => {
    if (t.resolved) return false;
    if (filterDocId && t.documentId !== filterDocId) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, { title: string; topics: WeakTopic[] }>>((acc, t) => {
    const docId = t.documentId;
    const title = t.document?.title ?? 'Unknown Note';
    if (!acc[docId]) acc[docId] = { title, topics: [] };
    acc[docId].topics.push(t);
    return acc;
  }, {});

  const unresolvedCount = topics.filter(t => !t.resolved).length;

  return (
    <div className="max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-sm text-[var(--text-1)]">Weak Topics</h1>
          <p className="text-body-sm mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
            Topics you&apos;ve consistently missed on quizzes
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444', border: '1px solid var(--danger-border)' }}>
                {unresolvedCount} to review
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          >
            {filterDocId ? documents.find(d => d.id === filterDocId)?.title ?? 'All notes' : 'All notes'}
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-3)' }}>
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {filterOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-50 rounded-xl shadow-xl py-1 min-w-[180px]"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => { setFilterDocId(''); setFilterOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: filterDocId === '' ? '#9747FF' : 'var(--text-1)' }}
              >
                All notes
              </button>
              {documents.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setFilterDocId(d.id); setFilterOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] transition-colors truncate"
                  style={{ color: filterDocId === d.id ? '#9747FF' : 'var(--text-1)' }}
                >
                  {d.title}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ backgroundColor: 'var(--success-subtle)' }}>🎉</div>
          <h2 className="text-body-lg font-semibold text-[var(--text-1)] mb-1">
            {unresolvedCount === 0 ? 'No weak topics!' : 'No topics match'}
          </h2>
          <p className="text-body-sm max-w-xs" style={{ color: 'var(--text-2)' }}>
            {unresolvedCount === 0
              ? 'Take quizzes to identify areas that need more review'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([docId, group]) => (
            <div key={docId}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📄</span>
                <h2 className="text-body-sm font-semibold text-[var(--text-1)]">{group.title}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}>
                  {group.topics.length} topic{group.topics.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Grid of cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.topics.map(topic => (
                  <WeakTopicItem
                    key={topic.id}
                    topic={topic}
                    linkToDocument
                    onResolved={handleResolved}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
