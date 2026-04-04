'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import WeakTopicItem from '@/components/dashboard/WeakTopicItem';
import Select from '@/components/ui/Select';

export default function WeakTopicsPage() {
  const [topics, setTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDocId, setFilterDocId] = useState<string>('');
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
    <div className="max-w-3xl mx-auto px-6 py-6">
      <PageHeader
        title="Weak Topics"
        subtitle={
          <span className="flex items-center gap-2">
            Topics you&apos;ve consistently missed on quizzes
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444', border: '1px solid var(--danger-border)' }}>
                {unresolvedCount} to review
              </span>
            )}
          </span>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select
          value={filterDocId}
          onChange={setFilterDocId}
          placeholder="All notes"
          options={[
            { value: '', label: 'All notes' },
            ...documents.map(d => ({ value: d.id, label: d.title })),
          ]}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <FileText size={14} style={{ color: 'var(--text-3)' }} />
                <h2 className="text-body-sm font-semibold text-[var(--text-1)]">{group.title}</h2>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}>
                  {group.topics.length} topic{group.topics.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Grid of cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
