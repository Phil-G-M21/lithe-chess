import React, { useState, useMemo, useEffect } from 'react';
import { CASES, CASE_AREAS, getCasesByArea } from '../data/cases';

const AREA_COLORS = {
  Contract: '#d0b0ff', Tort: '#f9a8c9', 'Land Law': '#7ecfc0',
  'Equity & Trusts': '#f0c060', Criminal: '#e07070', Constitutional: '#8ab8e8', All: '#b8a8d4',
};

const STORE = 'lithe_cases_solved';

export default function CasesPuzzle() {
  const [area, setArea] = useState('All');
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; }
  });

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(solved)); } catch {} }, [solved]);

  const list = useMemo(() => getCasesByArea(area), [area]);
  const kase = list[idx % list.length];

  useEffect(() => { setPicked(null); setRevealed(false); }, [kase]);

  function choose(i) {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    if (i === kase.answer && !solved.includes(kase.id)) {
      setSolved(s => [...s, kase.id]);
    }
  }

  function next() { setIdx(i => (i + 1) % list.length); }
  function prev() { setIdx(i => (i - 1 + list.length) % list.length); }
  function shuffle() { setIdx(Math.floor(Math.random() * list.length)); }

  const clr = AREA_COLORS[kase.area] || '#b8a8d4';
  const isCorrect = picked === kase.answer;
  const solvedCount = solved.length;
  const areaSolved = list.filter(c => solved.includes(c.id)).length;

  return (
    <div style={{ padding: '1rem', fontFamily: "'IBM Plex Mono', monospace", color: '#b8a8d4' }}>
      <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: '#4a3a6a', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Case files <span style={{ flex: 1, height: '0.5px', background: '#1e1530' }} />
        <span style={{ color: '#7ecfc0' }}>{solvedCount} / {CASES.length} solved</span>
      </div>

      <p style={{ fontSize: '0.62rem', color: '#5a4a8a', lineHeight: 1.7, marginBottom: '0.85rem' }}>
        Read the facts, decide the outcome, then see the principle and the case behind it. These are for learning legal reasoning, not legal advice.
      </p>

      {/* Area filter */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {CASE_AREAS.map(a => (
          <button key={a} onClick={() => { setArea(a); setIdx(0); }} style={{
            background: area === a ? '#1a1228' : '#0e0c18',
            border: `0.5px solid ${area === a ? (AREA_COLORS[a] || '#7b3fff') : '#2a1e42'}`,
            color: area === a ? (AREA_COLORS[a] || '#d0b0ff') : '#4a3a6a',
            fontFamily: 'inherit', fontSize: '0.52rem', padding: '0.3rem 0.55rem',
            borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.04em',
          }}>{a}</button>
        ))}
      </div>

      {/* Case card */}
      <div style={{ background: '#0d0b16', border: `0.5px solid ${clr}44`, borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.85rem', borderBottom: '0.5px solid #1e1530' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.55rem', color: clr, background: '#0a0814', border: `0.5px solid ${clr}`, padding: '0.2rem 0.5rem', borderRadius: '3px' }}>{kase.area}</span>
            {kase.historic && <span style={{ fontSize: '0.52rem', color: '#f0c060', background: '#1a1208', border: '0.5px solid #5a4a10', padding: '0.2rem 0.45rem', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><i className="ti ti-award" style={{ fontSize: '11px' }} />Landmark</span>}
            {solved.includes(kase.id) && <span style={{ fontSize: '0.52rem', color: '#7ecfc0', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><i className="ti ti-circle-check" style={{ fontSize: '12px' }} />solved</span>}
            <span style={{ fontSize: '0.55rem', color: '#4a3a6a', marginLeft: 'auto' }}>{'\u25CF'.repeat(kase.difficulty)}{'\u25CB'.repeat(3 - kase.difficulty)}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#d8c8f0', fontFamily: "'Cinzel', serif" }}>{kase.title}</div>
        </div>

        <div style={{ padding: '0.85rem' }}>
          <p style={{ fontSize: '0.72rem', color: '#c0a8e8', lineHeight: 1.85, marginBottom: '0.85rem' }}>{kase.scenario}</p>
          <div style={{ fontSize: '0.7rem', color: clr, fontWeight: 500, marginBottom: '0.7rem', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
            <i className="ti ti-gavel" style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }} />{kase.question}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {kase.options.map((opt, i) => {
              let bg = '#0e0c18', bd = '#2a1e42', col = '#b8a8d4';
              if (revealed) {
                if (i === kase.answer) { bg = '#0a1a12'; bd = '#2a6a3a'; col = '#7ecfc0'; }
                else if (i === picked) { bg = '#1a0a0a'; bd = '#6a2a2a'; col = '#e07070'; }
              }
              return (
                <button key={i} onClick={() => choose(i)} disabled={revealed} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left',
                  background: bg, border: `0.5px solid ${bd}`, color: col,
                  fontFamily: 'inherit', fontSize: '0.68rem', padding: '0.65rem 0.75rem',
                  borderRadius: '6px', cursor: revealed ? 'default' : 'pointer', lineHeight: 1.5,
                }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0a0814', border: `0.5px solid ${bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', flexShrink: 0, color: col }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {revealed && i === kase.answer && <i className="ti ti-check" style={{ fontSize: '14px', color: '#7ecfc0' }} />}
                  {revealed && i === picked && i !== kase.answer && <i className="ti ti-x" style={{ fontSize: '14px', color: '#e07070' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Verdict + principle */}
        {revealed && (
          <div style={{ padding: '0 0.85rem 0.85rem' }}>
            <div style={{ background: isCorrect ? '#0a1a12' : '#160a0a', border: `0.5px solid ${isCorrect ? '#2a6a3a' : '#5a2a2a'}`, borderRadius: '6px', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.58rem', color: isCorrect ? '#7ecfc0' : '#e07070', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className={`ti ${isCorrect ? 'ti-scale' : 'ti-alert-triangle'}`} style={{ fontSize: '13px' }} />
                {isCorrect ? 'Correct ruling' : 'The correct answer was ' + String.fromCharCode(65 + kase.answer)}
              </div>
              <p style={{ fontSize: '0.7rem', color: '#c8b8e8', lineHeight: 1.85 }}>{kase.principle}</p>
              {kase.landmark && (
                <div style={{ marginTop: '0.6rem', paddingTop: '0.55rem', borderTop: '0.5px solid #1e1530', fontSize: '0.6rem', color: '#8a7aaa', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <i className="ti ti-book-2" style={{ fontSize: '12px', color: '#7a5a9a' }} />
                  <span style={{ fontStyle: 'italic' }}>{kase.landmark}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <button onClick={prev} style={navBtn}><i className="ti ti-chevron-left" style={{ fontSize: '14px' }} /></button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.55rem', color: '#4a3a6a' }}>
          {(idx % list.length) + 1} of {list.length}{area !== 'All' ? ` (${areaSolved} solved here)` : ''}
        </div>
        {!revealed
          ? <button onClick={shuffle} style={navBtn}><i className="ti ti-arrows-shuffle" style={{ fontSize: '14px' }} /></button>
          : <button onClick={next} style={{ ...navBtn, background: '#2a1a48', borderColor: '#7b3fff', color: '#d0b0ff', flex: 1.5, display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>Next case <i className="ti ti-chevron-right" style={{ fontSize: '14px' }} /></button>}
      </div>
    </div>
  );
}

const navBtn = { background: '#1a1228', border: '0.5px solid #3a2a5a', color: '#b8a8d4', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', padding: '0.5rem 0.9rem', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
