import React, { useState } from 'react';

const TONE = {
  brilliant: { border: '#c0a000', bg: '#1a1500', label: '#f0c060', icon: 'ti-sparkles' },
  best: { border: '#2a7a4a', bg: '#0a1a12', label: '#7ecfc0', icon: 'ti-star' },
  excellent: { border: '#2a7a4a', bg: '#0a1a12', label: '#7ecfc0', icon: 'ti-check' },
  good: { border: '#2a5a8a', bg: '#0a1218', label: '#8ab8e8', icon: 'ti-thumb-up' },
  interesting: { border: '#5a4a8a', bg: '#0e0c18', label: '#b8a8d4', icon: 'ti-help' },
  inaccuracy: { border: '#8a6a10', bg: '#1a1208', label: '#f0c060', icon: 'ti-alert-circle' },
  mistake: { border: '#8a3020', bg: '#1a0a08', label: '#e09070', icon: 'ti-x' },
  blunder: { border: '#9a2020', bg: '#1a0808', label: '#e07070', icon: 'ti-flame' },
  ai: { border: '#5a2fa0', bg: '#0d0b1a', label: '#a07ad0', icon: 'ti-robot' },
  warn: { border: '#9a4020', bg: '#1a0e08', label: '#e08060', icon: 'ti-alert-triangle' },
  info: { border: '#3a2a5a', bg: '#0d0b16', label: '#8a7aaa', icon: 'ti-school' },
  info2: { border: '#3a2a5a', bg: '#0d0b16', label: '#8a7aaa', icon: 'ti-info-circle' },
};

export default function TutorBox({ comment, onHint, onSuggest, moveNumber }) {
  const [hint, setHint] = useState(null);

  if (!comment) return null;
  const s = TONE[comment.tone] || TONE.info;

  const doHint = (level) => { if (onHint) setHint(onHint(level)); };

  return (
    <div style={{ margin: '0.75rem 0', fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: '6px', padding: '0.75rem 0.85rem', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
          <i className={`ti ${s.icon}`} style={{ fontSize: '13px', color: s.label }} />
          <span style={{ fontSize: '0.58rem', color: s.label, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>
            {comment.emoji && <span style={{ marginRight: '4px' }}>{comment.emoji}</span>}{comment.label}
          </span>
          {moveNumber > 0 && <span style={{ marginLeft: 'auto', fontSize: '0.52rem', color: '#3a2a5a' }}>move {moveNumber}</span>}
        </div>
        <p style={{ fontSize: '0.72rem', color: '#c0a8e8', lineHeight: 1.8, marginBottom: comment.tip ? '0.5rem' : 0, whiteSpace: 'pre-line' }}>{comment.text}</p>
        {comment.tip && (
          <div style={{ fontSize: '0.62rem', color: '#7a5a9a', marginTop: '0.45rem', fontStyle: 'italic', lineHeight: 1.65, borderTop: '0.5px solid #1e1530', paddingTop: '0.45rem', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
            <i className="ti ti-bulb" style={{ fontSize: '11px', color: '#5a3a8a', flexShrink: 0, marginTop: '2px' }} />{comment.tip}
          </div>
        )}
        {hint && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.65rem', background: '#0a0814', border: '0.5px solid #3a2a5a', borderRadius: '4px', fontSize: '0.68rem', color: '#d0b0ff', lineHeight: 1.7 }}>
            <span style={{ fontSize: '0.5rem', color: '#5a2fa0', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.25rem' }}>Hint level {hint.level}</span>
            {hint.text}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => doHint(1)} style={hb('#7a5a9a')}><i className="ti ti-eye" style={{ fontSize: '12px' }} /> Idea</button>
        <button onClick={() => doHint(2)} style={hb('#a07ad0')}><i className="ti ti-eye-check" style={{ fontSize: '12px' }} /> Piece</button>
        <button onClick={() => doHint(3)} style={hb('#d0b0ff')}><i className="ti ti-bulb" style={{ fontSize: '12px' }} /> Move</button>
        {onSuggest && <button onClick={onSuggest} style={{ ...hb('#d0b0ff'), marginLeft: 'auto', background: '#2a1a48', borderColor: '#7b3fff' }}><i className="ti ti-chess" style={{ fontSize: '12px' }} /> Candidates</button>}
      </div>
    </div>
  );
}

function hb(color) {
  return { background: '#1a1228', border: '0.5px solid #2a1e42', color, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.06em', padding: '0.32rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' };
}
