'use client';

import { useState } from 'react';

const NOTES = [
  {
    id: '1',
    title: 'Cell Biology – Lecture 1',
    preview: 'This lecture introduces the structure of eukaryotic cells and the function of key organelles including the nucleus, mitochondria, and ER.',
    time: '2h ago',
    tags: [{ name: 'Bio', color: '#22C55E' }],
  },
  {
    id: '2',
    title: 'Mitosis & Meiosis Notes',
    preview: 'Mitosis produces two genetically identical daughter cells. Meiosis produces four genetically unique cells for sexual reproduction.',
    time: '1d ago',
    tags: [{ name: 'Bio', color: '#22C55E' }],
  },
  {
    id: '3',
    title: 'Cold War Overview',
    preview: 'The Cold War was a period of geopolitical tension between the US and the Soviet Union from 1947 to 1991.',
    time: '1d ago',
    tags: [],
  },
  {
    id: '4',
    title: 'Calculus – Limits & Derivatives',
    preview: 'A derivative measures the instantaneous rate of change of a function at a given point using the limit definition.',
    time: '2d ago',
    tags: [{ name: 'Math', color: '#3B82F6' }],
  },
  {
    id: '5',
    title: 'Psychology: Memory & Cognition',
    preview: 'Memory encodes, stores, and retrieves information through sensory, short-term, and long-term memory systems.',
    time: '2d ago',
    tags: [],
  },
  {
    id: '6',
    title: 'Organic Chemistry – Functional Groups',
    preview: 'Functional groups are specific groupings of atoms that determine the characteristic chemical reactions of organic molecules.',
    time: '3d ago',
    tags: [{ name: 'Chem', color: '#F59E0B' }],
  },
];

const NOTE_HTML = `
<h2>Summary</h2>
<p>This lecture introduces the foundational concepts of cell biology, covering cell structure, organelle functions, and the key differences between prokaryotic and eukaryotic cells. We also examined the roles of the cell membrane and cell wall in maintaining cell integrity.</p>

<h2>Cell Types</h2>
<p><strong>Prokaryotic cells</strong> – no membrane-bound nucleus. DNA floats freely in the cytoplasm. (e.g. bacteria)</p>
<p><strong>Eukaryotic cells</strong> – contain a true nucleus enclosed by a nuclear envelope. (e.g. animal, plant, fungal cells)</p>
<p><strong>Key Point:</strong> All cells share three basic components: a cell membrane, cytoplasm, and DNA.</p>

<h2>Major Organelles</h2>
<p><strong>Nucleus</strong> – "control center." Stores DNA and directs protein synthesis via mRNA.</p>
<p><strong>Mitochondria</strong> – produces ATP through cellular respiration. Called the "powerhouse of the cell."</p>
<p><strong>Ribosomes</strong> – synthesize proteins. Found free-floating in the cytoplasm or attached to rough ER.</p>
<p><strong>Endoplasmic Reticulum (ER):</strong></p>
<ul>
  <li><strong>Rough ER</strong> – studded with ribosomes; processes and transports proteins</li>
  <li><strong>Smooth ER</strong> – no ribosomes; synthesizes lipids and detoxifies substances</li>
</ul>
<p><strong>Golgi Apparatus</strong> – packages and ships proteins to their final destination (the cell's postal service).</p>
<p><strong>Vacuoles</strong> – storage organelles. Plant cells have a large central vacuole that maintains turgor pressure.</p>
<p><strong>Chloroplasts</strong> – plant cells only. Site of photosynthesis; converts sunlight into glucose.</p>

<h2>Cell Membrane vs. Cell Wall</h2>
<ul>
  <li><strong>Cell membrane</strong> – present in ALL cells. Phospholipid bilayer. Selectively permeable — controls what enters and exits.</li>
  <li><strong>Cell wall</strong> – found in plants, fungi, and bacteria only. Rigid outer layer that provides structure and protection. Not selectively permeable.</li>
</ul>

<h2>Key Terms</h2>
<p><strong>Organelle:</strong> A specialized structure within a cell that performs a specific function.</p>
<p><strong>Selectively permeable:</strong> Allows certain substances to pass through the membrane while blocking others.</p>
<p><strong>ATP:</strong> Adenosine triphosphate — the primary energy currency used by cells.</p>

<h2>Key Takeaways</h2>
<ul>
  <li>Eukaryotic cells have membrane-bound organelles; prokaryotic cells do not</li>
  <li>Each organelle has a distinct role that keeps the cell functioning</li>
  <li>Plant cells have both a cell wall and a cell membrane; animal cells only have the membrane</li>
  <li>Chloroplasts and large central vacuoles are unique to plant cells</li>
</ul>
`;

const TUTOR_MESSAGES: { role: 'user' | 'assistant'; content: string }[] = [
  {
    role: 'user',
    content: "What's the difference between the cell wall and the cell membrane?",
  },
  {
    role: 'assistant',
    content: 'The <strong>cell membrane</strong> is a thin, flexible phospholipid bilayer found in <em>all</em> cells — it controls what enters and exits. The <strong>cell wall</strong> is a rigid outer layer found only in plant, fungal, and bacterial cells. It sits outside the membrane and provides structural support, but it\'s not selectively permeable the way the membrane is.',
  },
  {
    role: 'user',
    content: 'So plants have both but animal cells only have the membrane?',
  },
];

const TABS = ['Notes', 'Flashcards', 'Quiz', 'Podcast', 'Weak Topics'];

export default function ScreenshotPage() {
  const [selectedId, setSelectedId] = useState('1');
  const selected = NOTES.find(n => n.id === selectedId) ?? NOTES[0];

  return (
    <div className="flex h-full overflow-hidden">

      {/* LEFT: Note list */}
      <div
        className="flex flex-col shrink-0 w-[280px] overflow-hidden"
        style={{ borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}
      >
        <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xs font-semibold text-[var(--text-1)]">Notes</h1>
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>Search notes…</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {NOTES.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              className="mx-2 my-2 px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
              style={{ backgroundColor: selectedId === note.id ? 'var(--bg-hover)' : 'var(--bg-card)' }}
            >
              <p className="text-xs font-medium leading-snug text-[var(--text-1)]">{note.title}</p>
              <p className="text-xs mt-0.5 line-clamp-1 leading-snug" style={{ color: 'var(--text-2)' }}>
                {note.preview}
              </p>
              {note.tags.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  {note.tags.map(t => (
                    <span
                      key={t.name}
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: t.color + '25', color: t.color }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1.5">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>Edited {note.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE: Note detail */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Top bar */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-[var(--text-1)] truncate flex-1">{selected.title}</span>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6500 0%, #FF9A3C 100%)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              AI Tutor
            </button>
            <button className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--text-2)]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-[var(--text-1)] mb-3">{selected.title}</h1>

          {/* Add tag */}
          <div className="flex items-center gap-1.5 mb-6">
            <button
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ color: 'var(--text-3)', border: '1px dashed var(--border)' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add tag
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            {TABS.map(tab => (
              <button
                key={tab}
                className="px-4 py-2 text-xs font-medium transition-colors"
                style={{
                  color: tab === 'Notes' ? 'var(--brand)' : 'var(--text-3)',
                  borderBottom: tab === 'Notes' ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Note content */}
          <div
            className="prose prose-headings:text-[var(--text-1)] prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-2 prose-p:text-[var(--text-1)] prose-p:leading-relaxed prose-p:my-1 prose-strong:text-[var(--text-1)] prose-li:text-[var(--text-1)] prose-ul:my-2 max-w-none"
            dangerouslySetInnerHTML={{ __html: NOTE_HTML }}
          />
        </div>
      </div>

      {/* RIGHT: Tutor panel */}
      <div
        className="flex flex-col shrink-0 w-[380px] overflow-hidden"
        style={{ borderLeft: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <span className="text-xs font-semibold text-[var(--text-1)]">AI Tutor</span>
          <button className="text-[var(--text-3)] hover:text-[var(--text-1)] text-lg leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {TUTOR_MESSAGES.map((msg, i) =>
            msg.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-[var(--text-1)] max-w-[80%] whitespace-pre-wrap leading-relaxed text-sm"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  {msg.content}
                </div>
              </div>
            ) : (
              <div
                key={i}
                className="text-sm text-[var(--text-1)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            )
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 px-3 pb-3">
          <div className="mb-2 flex items-center gap-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: 'rgba(255,101,0,0.1)', color: 'var(--brand)' }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Cell Biology – Lecture 1
              <span className="ml-0.5 opacity-50">×</span>
            </span>
          </div>
          <div
            className="flex items-end gap-2 px-3 py-2.5 rounded-2xl"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}
          >
            <span className="flex-1 text-xs" style={{ color: 'var(--text-3)' }}>Ask your tutor…</span>
            <button
              className="w-7 h-7 rounded-full flex items-center justify-center opacity-30"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
