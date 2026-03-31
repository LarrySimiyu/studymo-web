'use client';

import { useEffect, useState } from 'react';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';

export default function WeakTopicsPage() {
  const [topics, setTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [filterDocId, setFilterDocId] = useState<string>('');
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    weakTopicsApi.getAll().then(res => { if (res.data) setTopics(res.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleResolve(id: string) {
    setResolving(id);
    try {
      const { data: updated } = await weakTopicsApi.resolve(id);
      if (!updated) return;
      setTopics(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      // ignore
    } finally {
      setResolving(null);
    }
  }

  // Unique documents from topics
  const documents = Array.from(new Map(
    topics.filter(t => t.document).map(t => [t.documentId, t.document!])
  ).entries()).map(([id, doc]) => ({ id, title: doc.title }));

  const filtered = topics.filter(t => {
    if (!showResolved && t.resolved) return false;
    if (filterDocId && t.documentId !== filterDocId) return false;
    return true;
  });

  // Group by document
  const grouped = filtered.reduce<Record<string, { title: string; topics: WeakTopic[] }>>((acc, t) => {
    const docId = t.documentId;
    const title = t.document?.title ?? 'Unknown Document';
    if (!acc[docId]) acc[docId] = { title, topics: [] };
    acc[docId].topics.push(t);
    return acc;
  }, {});

  const unresolvedCount = topics.filter(t => !t.resolved).length;

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Weak Topics</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Topics you&apos;ve consistently missed on quizzes
            {unresolvedCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                {unresolvedCount} to review
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={filterDocId}
          onChange={e => setFilterDocId(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-white outline-none"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
        >
          <option value="">All documents</option>
          {documents.map(d => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <div
            onClick={() => setShowResolved(s => !s)}
            className="w-8 h-4 rounded-full relative transition-colors cursor-pointer"
            style={{ backgroundColor: showResolved ? '#9747FF' : '#2A2A2A' }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
              style={{ left: showResolved ? '17px' : '2px' }}
            />
          </div>
          Show resolved
        </label>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: '#1A1A1A' }} />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ backgroundColor: '#22C55E20' }}>
            🎉
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">
            {unresolvedCount === 0 && !showResolved ? 'No weak topics!' : 'No topics match'}
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            {unresolvedCount === 0 && !showResolved
              ? 'Take quizzes to identify areas that need more review'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([docId, group]) => (
            <div key={docId}>
              <h2 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="text-base">📄</span>
                {group.title}
                <span className="text-xs text-gray-500 font-normal">{group.topics.length} topic{group.topics.length !== 1 ? 's' : ''}</span>
              </h2>
              <div className="space-y-2">
                {group.topics.map(topic => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{
                      backgroundColor: '#1A1A1A',
                      border: `1px solid ${topic.resolved ? '#22C55E30' : '#2A2A2A'}`,
                      opacity: topic.resolved ? 0.7 : 1,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: topic.resolved ? '#22C55E20' : '#EF444420' }}
                    >
                      <span className="text-base">{topic.resolved ? '✅' : '⚠️'}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{topic.topic}</p>
                      {topic.correctAnswer && (
                        <p className="text-xs mt-1 px-2 py-1 rounded-lg inline-block" style={{ backgroundColor: '#22C55E15', color: '#22C55E' }}>
                          ✓ {topic.correctAnswer}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          Missed <span className="font-medium" style={{ color: topic.missedCount >= 5 ? '#EF4444' : topic.missedCount >= 3 ? '#F59E0B' : '#9CA3AF' }}>{topic.missedCount}×</span>
                        </span>
                        <span className="text-xs text-gray-600">
                          Last: {new Date(topic.lastMissedAt).toLocaleDateString()}
                        </span>
                        {topic.resolved && topic.resolvedAt && (
                          <span className="text-xs" style={{ color: '#22C55E' }}>Resolved {new Date(topic.resolvedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {!topic.resolved && (
                      <button
                        onClick={() => handleResolve(topic.id)}
                        disabled={resolving === topic.id}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}
                      >
                        {resolving === topic.id ? '...' : 'Resolve'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
