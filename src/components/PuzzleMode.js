import React, { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { PUZZLES, PUZZLE_THEMES, getPuzzlesByTheme } from '../data/puzzles';

export default function PuzzleMode({ onSolve }) {
  const [theme, setTheme] = useState('All');
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('solving'); // solving | solved | failed
  const [showHint, setShowHint] = useState(false);
  const [game, setGame] = useState(null);
  const [wrongMove, setWrongMove] = useState(null);

  const puzzles = useMemo(() => getPuzzlesByTheme(theme), [theme]);
  const puzzle = puzzles[idx % puzzles.length];

  const chess = useMemo(() => {
    const c = new Chess(puzzle.fen);
    return c;
  }, [puzzle]);

  const [position, setPosition] = useState(puzzle.fen);

  React.useEffect(() => {
    setPosition(puzzle.fen);
    setStatus('solving');
    setShowHint(false);
    setWrongMove(null);
  }, [puzzle]);

  function onDrop(from, to) {
    if (status !== 'solving') return false;
    const sol = puzzle.solution[0];
    const testGame = new Chess(puzzle.fen);
    let move;
    try {
      move = testGame.move({ from, to, promotion: 'q' });
    } catch {
      return false;
    }
    if (!move) return false;

    if (from === sol.from && to === sol.to) {
      setPosition(testGame.fen());
      setStatus('solved');
      if (onSolve) onSolve(true);
      return true;
    } else {
      setWrongMove({ from, to });
      setStatus('failed');
      if (onSolve) onSolve(false);
      // Reset position after showing the wrong move briefly
      setPosition(testGame.fen());
      setTimeout(() => setPosition(puzzle.fen), 800);
      return true;
    }
  }

  function nextPuzzle() {
    setIdx(i => (i + 1) % puzzles.length);
  }

  function retry() {
    setPosition(puzzle.fen);
    setStatus('solving');
    setWrongMove(null);
  }

  const themeColors = {
    Fork: '#d0b0ff', Pin: '#f9a8c9', Skewer: '#f0c060',
    Checkmate: '#e07070', 'Discovered Attack': '#7ecfc0', All: '#b8a8d4',
  };

  return (
    <div style={{ padding: '1rem', fontFamily: "'IBM Plex Mono', monospace", color: '#b8a8d4' }}>
      <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: '#4a3a6a', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Puzzle trainer <span style={{ flex: 1, height: '0.5px', background: '#1e1530' }} />
      </div>

      {/* Theme selector */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {PUZZLE_THEMES.map(t => (
          <button key={t} onClick={() => { setTheme(t); setIdx(0); }} style={{
            background: theme === t ? '#1a1228' : '#0e0c18',
            border: `0.5px solid ${theme === t ? themeColors[t] : '#2a1e42'}`,
            color: theme === t ? themeColors[t] : '#4a3a6a',
            fontFamily: 'inherit', fontSize: '0.52rem', padding: '0.3rem 0.55rem',
            borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.05em',
          }}>{t}</button>
        ))}
      </div>

      {/* Puzzle info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.62rem', color: themeColors[puzzle.theme] || '#b8a8d4', background: '#0e0c18', border: `0.5px solid ${themeColors[puzzle.theme]}`, padding: '0.2rem 0.5rem', borderRadius: '3px' }}>{puzzle.theme}</span>
          <span style={{ fontSize: '0.55rem', color: '#4a3a6a' }}>{'●'.repeat(puzzle.difficulty)}{'○'.repeat(3 - puzzle.difficulty)}</span>
        </div>
        <span style={{ fontSize: '0.55rem', color: '#4a3a6a' }}>{(idx % puzzles.length) + 1} / {puzzles.length}</span>
      </div>

      {/* Prompt */}
      <div style={{ background: '#0d0b16', border: '0.5px solid #2a1e42', borderRadius: '5px', padding: '0.6rem 0.75rem', marginBottom: '0.65rem', fontSize: '0.68rem', color: '#c0a8e8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="ti ti-target" style={{ fontSize: '14px', color: themeColors[puzzle.theme] }} />
        {puzzle.toMove === 'white' ? 'White' : 'Black'} to move, find the best move.
      </div>

      {/* Board */}
      <div style={{ borderRadius: '6px', overflow: 'hidden', border: `1px solid ${status === 'solved' ? '#2a6a3a' : status === 'failed' ? '#6a2a2a' : '#2a1e42'}`, marginBottom: '0.65rem', transition: 'border-color 0.3s' }}>
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          boardOrientation={puzzle.toMove}
          arePiecesDraggable={status === 'solving'}
          customDarkSquareStyle={{ backgroundColor: '#1e1530' }}
          customLightSquareStyle={{ backgroundColor: '#2a2040' }}
          animationDuration={200}
        />
      </div>

      {/* Status feedback */}
      {status === 'solved' && (
        <div style={{ background: '#0a1a12', border: '0.5px solid #2a6a3a', borderRadius: '6px', padding: '0.85rem', marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.6rem', color: '#7ecfc0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="ti ti-check" /> Solved!
          </div>
          <p style={{ fontSize: '0.7rem', color: '#c0a8e8', lineHeight: 1.8 }}>{puzzle.explanation}</p>
        </div>
      )}

      {status === 'failed' && (
        <div style={{ background: '#1a0a0a', border: '0.5px solid #6a2a2a', borderRadius: '6px', padding: '0.85rem', marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.6rem', color: '#e07070', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="ti ti-x" /> Not quite
          </div>
          <p style={{ fontSize: '0.68rem', color: '#c0a8e8', lineHeight: 1.7 }}>That's not the best move here. Try again, or use a hint.</p>
        </div>
      )}

      {showHint && status === 'solving' && (
        <div style={{ background: '#1a1208', border: '0.5px solid #5a4a10', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.65rem', fontSize: '0.68rem', color: '#f0c060', lineHeight: 1.7 }}>
          <i className="ti ti-bulb" style={{ marginRight: '5px' }} />{puzzle.hint}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {status === 'solving' && (
          <button onClick={() => setShowHint(true)} style={btn('#1a1228', '#5a2fa0', '#a07ad0')}>
            <i className="ti ti-bulb" style={{ fontSize: '13px' }} /> Hint
          </button>
        )}
        {status === 'failed' && (
          <button onClick={retry} style={btn('#1a1228', '#7b3fff', '#d0b0ff')}>
            <i className="ti ti-refresh" style={{ fontSize: '13px' }} /> Try again
          </button>
        )}
        {status === 'solved' && (
          <button onClick={nextPuzzle} style={btn('#2a1a48', '#7b3fff', '#d0b0ff')}>
            <i className="ti ti-arrow-right" style={{ fontSize: '13px' }} /> Next puzzle
          </button>
        )}
        <button onClick={nextPuzzle} style={{ ...btn('#1a1228', '#2a1e42', '#5a4a8a'), marginLeft: 'auto' }}>
          Skip
        </button>
      </div>
    </div>
  );
}

function btn(bg, border, color) {
  return { background: bg, border: `0.5px solid ${border}`, color, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' };
}
