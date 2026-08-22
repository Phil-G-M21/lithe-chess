import React, { useState, useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { OPENINGS } from '../data/pieces';

export default function OpeningTrainer() {
  const [openingIdx, setOpeningIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('watch'); // watch | practice
  const [position, setPosition] = useState('start');
  const [feedback, setFeedback] = useState(null);

  const opening = OPENINGS[openingIdx];

  const chess = useMemo(() => new Chess(), [openingIdx]);

  useEffect(() => {
    chess.reset();
    setPosition('start');
    setStep(0);
    setFeedback(null);
  }, [openingIdx, mode]);

  function playToStep(targetStep) {
    const c = new Chess();
    for (let i = 0; i < targetStep && i < opening.sequence.length; i++) {
      try { c.move(opening.sequence[i].move); } catch {}
    }
    setPosition(c.fen());
  }

  function nextStep() {
    if (step >= opening.sequence.length) return;
    const newStep = step + 1;
    playToStep(newStep);
    setStep(newStep);
  }

  function prevStep() {
    if (step <= 0) return;
    const newStep = step - 1;
    playToStep(newStep);
    setStep(newStep);
  }

  function reset() {
    chess.reset();
    setPosition('start');
    setStep(0);
    setFeedback(null);
  }

  function onDrop(from, to) {
    if (mode !== 'practice') return false;
    if (step >= opening.sequence.length) return false;
    const expected = opening.sequence[step];
    const c = new Chess();
    for (let i = 0; i < step; i++) {
      try { c.move(opening.sequence[i].move); } catch {}
    }
    let move;
    try { move = c.move({ from, to, promotion: 'q' }); } catch { return false; }
    if (!move) return false;

    if (move.san === expected.move || (move.from === from && move.to === to && expected.move.includes(to))) {
      setPosition(c.fen());
      setStep(step + 1);
      setFeedback({ ok: true, text: expected.note });
      return true;
    } else {
      setFeedback({ ok: false, text: `Not the ${opening.name} move. The line plays ${expected.move} here. Try again.` });
      return false;
    }
  }

  const done = step >= opening.sequence.length;

  return (
    <div style={{ padding: '1rem', fontFamily: "'IBM Plex Mono', monospace", color: '#b8a8d4' }}>
      <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: '#4a3a6a', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Opening trainer <span style={{ flex: 1, height: '0.5px', background: '#1e1530' }} />
      </div>

      {/* Opening selector */}
      <select value={openingIdx} onChange={e => setOpeningIdx(Number(e.target.value))} style={{
        width: '100%', background: '#0e0c18', border: '0.5px solid #3a2a5a', color: '#d0b0ff',
        fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.45rem 0.65rem', borderRadius: '4px',
        marginBottom: '0.65rem', outline: 'none',
      }}>
        {OPENINGS.map((o, i) => <option key={i} value={i} style={{ background: '#0e0c18' }}>{o.name} ({o.difficulty})</option>)}
      </select>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem' }}>
        <button onClick={() => setMode('watch')} style={{ flex: 1, ...modeBtn(mode === 'watch') }}>
          <i className="ti ti-eye" style={{ fontSize: '13px', marginRight: '4px' }} />Watch & learn
        </button>
        <button onClick={() => setMode('practice')} style={{ flex: 1, ...modeBtn(mode === 'practice') }}>
          <i className="ti ti-hand-finger" style={{ fontSize: '13px', marginRight: '4px' }} />Practice
        </button>
      </div>

      {/* Description */}
      <div style={{ background: '#0d0b16', border: `0.5px solid ${opening.color}44`, borderRadius: '5px', padding: '0.7rem 0.75rem', marginBottom: '0.65rem' }}>
        <div style={{ fontSize: '0.62rem', color: opening.color, fontFamily: 'monospace', marginBottom: '0.4rem', background: '#0a0814', padding: '0.25rem 0.5rem', borderRadius: '3px', display: 'inline-block' }}>{opening.moves}</div>
        <p style={{ fontSize: '0.67rem', color: '#b8a8d4', lineHeight: 1.7, marginBottom: '0.4rem' }}>{opening.description}</p>
        <div style={{ fontSize: '0.6rem', color: '#7a5a9a', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
          <i className="ti ti-target" style={{ fontSize: '12px', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ lineHeight: 1.6 }}>{opening.plan}</span>
        </div>
      </div>

      {/* Board */}
      <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a1e42', marginBottom: '0.65rem' }}>
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          arePiecesDraggable={mode === 'practice' && !done}
          customDarkSquareStyle={{ backgroundColor: '#1e1530' }}
          customLightSquareStyle={{ backgroundColor: '#2a2040' }}
          animationDuration={250}
        />
      </div>

      {/* Move progress */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
        {opening.sequence.map((s, i) => (
          <div key={i} style={{
            fontSize: '0.6rem', padding: '0.25rem 0.5rem', borderRadius: '3px',
            background: i < step ? '#1a1228' : '#0a0814',
            border: `0.5px solid ${i < step ? opening.color : '#2a1e42'}`,
            color: i < step ? opening.color : '#3a2a5a',
          }}>
            {s.by === 'w' ? 'W' : 'B'} {s.move}
          </div>
        ))}
      </div>

      {/* Current step note (watch mode) */}
      {mode === 'watch' && step > 0 && step <= opening.sequence.length && (
        <div style={{ background: '#0d0b16', border: '0.5px solid #3a2a5a', borderRadius: '5px', padding: '0.7rem', marginBottom: '0.65rem', fontSize: '0.68rem', color: '#c0a8e8', lineHeight: 1.7 }}>
          <span style={{ color: opening.color, fontWeight: 500 }}>{opening.sequence[step - 1].move}:</span> {opening.sequence[step - 1].note}
        </div>
      )}

      {/* Feedback (practice mode) */}
      {mode === 'practice' && feedback && (
        <div style={{ background: feedback.ok ? '#0a1a12' : '#1a0a0a', border: `0.5px solid ${feedback.ok ? '#2a6a3a' : '#6a2a2a'}`, borderRadius: '5px', padding: '0.7rem', marginBottom: '0.65rem', fontSize: '0.68rem', color: feedback.ok ? '#7ecfc0' : '#e07070', lineHeight: 1.7 }}>
          <i className={`ti ${feedback.ok ? 'ti-check' : 'ti-x'}`} style={{ marginRight: '5px' }} />{feedback.text}
        </div>
      )}

      {done && (
        <div style={{ background: '#0a1a12', border: '0.5px solid #2a6a3a', borderRadius: '5px', padding: '0.85rem', marginBottom: '0.65rem', textAlign: 'center' }}>
          <i className="ti ti-circle-check" style={{ fontSize: '1.5rem', color: '#7ecfc0', display: 'block', marginBottom: '0.4rem' }} />
          <div style={{ fontSize: '0.7rem', color: '#7ecfc0' }}>You completed the {opening.name}!</div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {mode === 'watch' ? (
          <>
            <button onClick={prevStep} disabled={step === 0} style={ctrlBtn}>
              <i className="ti ti-chevron-left" style={{ fontSize: '14px' }} />
            </button>
            <button onClick={nextStep} disabled={done} style={{ ...ctrlBtn, flex: 1, background: '#2a1a48', borderColor: '#7b3fff', color: '#d0b0ff' }}>
              {done ? 'Complete' : 'Next move'} <i className="ti ti-chevron-right" style={{ fontSize: '14px' }} />
            </button>
          </>
        ) : (
          <div style={{ fontSize: '0.65rem', color: '#7a5a9a', flex: 1, textAlign: 'center', padding: '0.4rem' }}>
            {done ? 'Line complete, well done!' : `Play the next move: ${opening.sequence[step]?.by === 'w' ? 'White' : 'Black'} to move`}
          </div>
        )}
        <button onClick={reset} style={ctrlBtn}>
          <i className="ti ti-refresh" style={{ fontSize: '14px' }} />
        </button>
      </div>
    </div>
  );
}

function modeBtn(active) {
  return { background: active ? '#1a1228' : '#0e0c18', border: `0.5px solid ${active ? '#7b3fff' : '#2a1e42'}`, color: active ? '#d0b0ff' : '#5a4a8a', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' };
}
const ctrlBtn = { background: '#1a1228', border: '0.5px solid #3a2a5a', color: '#b8a8d4', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', padding: '0.45rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' };
