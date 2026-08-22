import React, { useState } from 'react';
import { PIECES_INFO, TACTICS, LESSONS, LESSON_CONTENT } from '../data/pieces';

const PIECE_SVG = {
  K: ({ c }) => (<svg viewBox="0 0 45 45" width="72" height="72"><g fill={c} stroke="#2a1e42" strokeWidth="1.5" strokeLinejoin="round"><path d="M22.5 11.63V6M20 8h5" strokeLinecap="round"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0"/></g></svg>),
  Q: ({ c }) => (<svg viewBox="0 0 45 45" width="72" height="72"><g fill={c} stroke="#2a1e42" strokeWidth="1.5" strokeLinejoin="round"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/></g></svg>),
  R: ({ c }) => (<svg viewBox="0 0 45 45" width="72" height="72"><g fill={c} stroke="#2a1e42" strokeWidth="1.5" strokeLinejoin="round"><path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z"/><path d="M14 29.5v-13h17v13H14z"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z"/></g></svg>),
  B: ({ c }) => (<svg viewBox="0 0 45 45" width="72" height="72"><g fill={c} stroke="#2a1e42" strokeWidth="1.5" strokeLinejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/></g></svg>),
  N: ({ c }) => (<svg viewBox="0 0 45 45" width="72" height="72"><g fill={c} stroke="#2a1e42" strokeWidth="1.5" strokeLinejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 5.12-1.37 8.37-3.5 11-2.5 3.25-5.5 5.25-4.5 7.5-1-2.5 1-5 3.5-7.5 2.24-2.24 5.5-4.5 5-7-1-.5-2.5 1.5-3.5 1.5-1 0-3-.5-3-2.5 0-1.5 2.5-2.5 4.5-3.5 2-1 2.5-2 3-3.5"/><circle cx="9.5" cy="25.5" r=".8" fill="#2a1e42" stroke="none"/><path d="M15 15.5a.5 1.5 30 1 1-.9-.5.5 1.5 30 0 1 .9.5z" fill="#2a1e42" stroke="none"/></g></svg>),
  P: ({ c }) => (<svg viewBox="0 0 45 45" width="72" height="72"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.42-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill={c} stroke="#2a1e42" strokeWidth="1.5" strokeLinejoin="round"/></svg>),
};

const CM = { '#d0b0ff': { bg: '#1a0f2e', b: '#5a2fa0', t: '#d0b0ff' }, '#f9a8c9': { bg: '#1e0f18', b: '#8a3060', t: '#f9a8c9' }, '#7ecfc0': { bg: '#0a1a18', b: '#2a7a70', t: '#7ecfc0' }, '#f0c060': { bg: '#1a1208', b: '#8a6a10', t: '#f0c060' }, '#b8a8d4': { bg: '#12101a', b: '#4a3a7a', t: '#b8a8d4' }, '#c07070': { bg: '#1a0a0a', b: '#7a3030', t: '#c07070' } };

export default function PieceGuide({ progressHook }) {
  const [tab, setTab] = useState('pieces');
  const [piece, setPiece] = useState('K');
  const [tactic, setTactic] = useState(null);
  const [openLesson, setOpenLesson] = useState(null);

  const tabs = [{ id: 'pieces', label: 'Pieces' }, { id: 'lessons', label: 'Lessons' }, { id: 'tactics', label: 'Tactics' }];
  const info = PIECES_INFO[piece];
  const cm = CM[info.color] || CM['#b8a8d4'];
  const Svg = PIECE_SVG[piece];
  const completed = progressHook?.progress.lessonsCompleted || [];

  return (
    <div style={{ padding: '1rem', fontFamily: "'IBM Plex Mono', monospace", color: '#b8a8d4' }}>
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: tab === t.id ? '#1a1228' : 'transparent', border: `0.5px solid ${tab === t.id ? '#7b3fff' : '#2a1e42'}`, color: tab === t.id ? '#d0b0ff' : '#4a3a6a', fontFamily: 'inherit', fontSize: '0.58rem', letterSpacing: '0.1em', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'pieces' && (
        <div>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
            {['K', 'Q', 'R', 'B', 'N', 'P'].map(k => {
              const pi = PIECES_INFO[k]; const sel = k === piece;
              return (
                <button key={k} onClick={() => setPiece(k)} style={{ flex: 1, padding: '0.5rem 0.25rem', border: sel ? `1.5px solid ${pi.color}` : '0.5px solid #2a1e42', borderRadius: '6px', background: sel ? CM[pi.color]?.bg : '#0e0c18', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.4rem', color: sel ? pi.color : '#4a3a6a' }}>{pi.symbol}</span>
                  <span style={{ fontSize: '0.46rem', color: sel ? pi.color : '#3a2a5a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{pi.name.slice(0, 3)}</span>
                </button>
              );
            })}
          </div>
          <div style={{ background: cm.bg, border: `0.5px solid ${cm.b}`, borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
              <div style={{ background: '#0a0814', borderRadius: '8px', padding: '0.4rem', border: `0.5px solid ${cm.b}` }}>{Svg && <Svg c={info.color} />}</div>
              <div>
                <div style={{ fontSize: '1.2rem', color: cm.t, fontFamily: "'Cinzel', serif" }}>{info.name}</div>
                <div style={{ fontSize: '0.58rem', color: '#5a4a8a', marginTop: '0.2rem' }}>Value: {info.value}</div>
                <div style={{ fontSize: '0.6rem', color: '#7a5a9a', marginTop: '0.1rem' }}><i className="ti ti-arrows-move" style={{ fontSize: '11px', marginRight: '4px' }} />{info.movement}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#c0a8e8', lineHeight: 1.8, marginBottom: '0.75rem' }}>{info.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#0a1a12', border: '0.5px solid #2a5a3a', borderRadius: '5px', padding: '0.6rem' }}>
                <div style={{ fontSize: '0.5rem', color: '#4a9a6a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Strengths</div>
                {info.strengths.map((s, i) => <div key={i} style={{ fontSize: '0.62rem', color: '#7ecfc0', marginBottom: '0.25rem', display: 'flex', gap: '0.35rem' }}><span style={{ color: '#4a9a6a' }}>+</span>{s}</div>)}
              </div>
              <div style={{ background: '#1a0a0a', border: '0.5px solid #5a2a2a', borderRadius: '5px', padding: '0.6rem' }}>
                <div style={{ fontSize: '0.5rem', color: '#9a4a4a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Weaknesses</div>
                {info.weaknesses.map((w, i) => <div key={i} style={{ fontSize: '0.62rem', color: '#c07070', marginBottom: '0.25rem', display: 'flex', gap: '0.35rem' }}><span style={{ color: '#9a4a4a' }}>−</span>{w}</div>)}
              </div>
            </div>
            <div style={{ background: '#0d0b1a', border: '0.5px solid #2a1e42', borderRadius: '5px', padding: '0.7rem', marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.5rem', color: '#5a4a8a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}><i className="ti ti-bulb" style={{ fontSize: '11px', marginRight: '4px' }} />Pro tips</div>
              {info.tips.map((t, i) => <div key={i} style={{ fontSize: '0.65rem', color: '#b8a8d4', marginBottom: '0.35rem', display: 'flex', gap: '0.4rem', lineHeight: 1.6 }}><span style={{ color: cm.t }}>{i + 1}.</span>{t}</div>)}
            </div>
            <div style={{ borderLeft: `2px solid ${cm.b}`, paddingLeft: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.5rem', color: '#4a3a6a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Did you know</div>
              <p style={{ fontSize: '0.65rem', color: '#8a7aa8', lineHeight: 1.7, fontStyle: 'italic' }}>{info.funFact}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'lessons' && (
        <div>
          {openLesson ? (
            <div>
              <button onClick={() => setOpenLesson(null)} style={{ background: 'transparent', border: 'none', color: '#7a5a9a', fontFamily: 'inherit', fontSize: '0.6rem', cursor: 'pointer', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><i className="ti ti-chevron-left" style={{ fontSize: '13px' }} />Back to lessons</button>
              {LESSON_CONTENT[openLesson] ? (
                <div>
                  <div style={{ fontSize: '1.1rem', color: '#d0b0ff', fontFamily: "'Cinzel', serif", marginBottom: '0.85rem' }}>{LESSON_CONTENT[openLesson].title}</div>
                  {LESSON_CONTENT[openLesson].sections.map((s, i) => (
                    <div key={i} style={{ background: '#0e0c18', border: '0.5px solid #2a1e42', borderRadius: '6px', padding: '0.85rem', marginBottom: '0.6rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#d0b0ff', fontWeight: 500, marginBottom: '0.4rem' }}>{s.h}</div>
                      <p style={{ fontSize: '0.68rem', color: '#b8a8d4', lineHeight: 1.75 }}>{s.t}</p>
                    </div>
                  ))}
                  <button onClick={() => { if (progressHook) progressHook.completeLesson(openLesson); setOpenLesson(null); }} style={{ background: '#2a1a48', border: '0.5px solid #7b3fff', color: '#d0b0ff', fontFamily: 'inherit', fontSize: '0.62rem', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', width: '100%', marginTop: '0.5rem' }}>
                    <i className="ti ti-check" style={{ fontSize: '13px', marginRight: '5px' }} />Mark complete
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.7rem', color: '#7a5a9a', textAlign: 'center', padding: '2rem 0' }}>This lesson is coming soon. Keep playing to unlock more content.</div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.6rem', color: '#5a4a8a', marginBottom: '1rem', lineHeight: 1.7 }}>Work through these lessons in order. Complete them to build a real foundation.</div>
              {LESSONS.map(l => {
                const done = completed.includes(l.id);
                const locked = !l.unlocked;
                return (
                  <div key={l.id} onClick={() => !locked && setOpenLesson(l.id)} style={{ background: done ? '#0a1a12' : '#0e0c18', border: `0.5px solid ${done ? '#2a6a3a' : locked ? '#1e1530' : '#2a1e42'}`, borderRadius: '6px', padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.4 : 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: done ? '#2a6a3a' : '#1a1228', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ${locked ? 'ti-lock' : done ? 'ti-check' : l.icon}`} style={{ fontSize: '15px', color: done ? '#7ecfc0' : locked ? '#3a2a5a' : '#d0b0ff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', color: done ? '#7ecfc0' : locked ? '#4a3a6a' : '#d0b0ff', fontWeight: 500 }}>{l.title}</div>
                      <div style={{ fontSize: '0.58rem', color: '#5a4a8a', marginTop: '0.15rem' }}>{l.desc}</div>
                    </div>
                    {!locked && <i className="ti ti-chevron-right" style={{ fontSize: '14px', color: '#4a3a6a' }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'tactics' && (
        <div>
          <div style={{ fontSize: '0.6rem', color: '#5a4a8a', marginBottom: '1rem', lineHeight: 1.7 }}>Tactics win games. Learn these patterns, then practice them in Puzzle mode.</div>
          {TACTICS.map((t, i) => {
            const open = tactic === i; const tc = CM[t.color] || CM['#b8a8d4'];
            return (
              <div key={i} style={{ background: tc.bg, border: `0.5px solid ${open ? tc.b : '#2a1e42'}`, borderRadius: '6px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                <div onClick={() => setTactic(open ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer' }}>
                  <div style={{ width: '36px', height: '36px', background: '#0a0814', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, border: `0.5px solid ${tc.b}` }}><i className={`ti ${t.icon}`} style={{ fontSize: '17px', color: tc.t }} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', color: tc.t }}>{t.name}</div>
                    <div style={{ fontSize: '0.6rem', color: '#5a4a8a', marginTop: '0.1rem' }}>{t.description.slice(0, 50)}...</div>
                  </div>
                  <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '14px', color: '#4a3a6a' }} />
                </div>
                {open && (
                  <div style={{ padding: '0 0.75rem 0.75rem', borderTop: `0.5px solid ${tc.b}` }}>
                    <p style={{ fontSize: '0.7rem', color: '#c0a8e8', lineHeight: 1.8, marginTop: '0.65rem', marginBottom: '0.6rem' }}>{t.description}</p>
                    <div style={{ background: '#0a0814', border: `0.5px solid ${tc.b}`, borderRadius: '4px', padding: '0.6rem' }}>
                      <div style={{ fontSize: '0.5rem', color: '#4a3a6a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Example</div>
                      <p style={{ fontSize: '0.65rem', color: '#b8a8d4', lineHeight: 1.7, fontStyle: 'italic' }}>{t.example}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
