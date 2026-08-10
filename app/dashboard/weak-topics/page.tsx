'use client';

import { useEffect, useState } from 'react';
import { FileText, CircleCheck } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/dashboard/PageHeader';
import PageShell from '@/components/dashboard/PageShell';
import EmptyState from '@/components/dashboard/EmptyState';
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
    <PageShell
      width="lg"
      header={
        <PageHeader
          title="Weak Topics"
          subtitle={
            <span className="flex items-center gap-2">
              Topics you&apos;ve consistently missed on quizzes
              {unresolvedCount > 0 && (
                <span className="rounded-full border border-[var(--danger-border)] bg-[var(--danger-subtle)] px-2 py-0.5 text-2xs font-medium text-[var(--danger-ink)]">
                  {unresolvedCount} to review
                </span>
              )}
            </span>
          }
        />
      }
    >

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
        <EmptyState
          icon={CircleCheck}
          accent="var(--success-ink)"
          accentBg="var(--success-subtle)"
          title={unresolvedCount === 0 ? 'No weak topics' : 'No topics match'}
          description={unresolvedCount === 0
            ? 'Take quizzes to identify areas that need more review.'
            : 'Try adjusting your filters.'}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([docId, group]) => (
            <div key={docId}>
              {/* Group header */}
              <SectionHeading
                action={
                  <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-xs text-[var(--text-2)]">
                    {group.topics.length} topic{group.topics.length !== 1 ? 's' : ''}
                  </span>
                }
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} className="shrink-0 text-[var(--text-3)]" />
                  {group.title}
                </span>
              </SectionHeading>

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
    </PageShell>
  );
}
