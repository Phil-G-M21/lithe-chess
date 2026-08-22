import React, { useState, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import TutorBox from './TutorBox';
import { getBestMove, getTopMoves, evaluateMoveQuality, LEVEL_ELO } from '../engine/chessAI';
import { getTutorComment } from '../engine/tutor';

const MODES = [
  { id: 'beginner', label: 'Beginner', desc: 'Learn with full explanations. AI plays gently.' },
  { id: 'learning', label: 'Learning', desc: 'AI explains after important moves.' },
  { id: 'coach', label: 'Coach', desc: 'AI asks questions. You find the answers.' },
  { id: 'free', label: 'Free Play', desc: 'Normal chess, adjustable AI strength.' },
];

const QCOLOR = { brilliant: '#f0c060', best: '#7ecfc0', excellent: '#7ecfc0', good: '#8ab8e8', interesting: '#b8a8d4', inaccuracy: '#f0c060', mistake: '#e09070', blunder: '#e07070' };

export default function ChessGame({ progressHook }) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(new Chess().fen());
  const [comment, setComment] = useState({
    tone: 'info', label: 'Welcome, Lithe',
    text: "You play white, white moves first. Pick a mode below, then drag a piece to move. I'll coach you on every move you make and every move the computer makes.",
    tip: "Opening tip: start with e2 to e4, or d2 to d4. Center pawns are the strongest first move in chess.",
  });
  const [level, setLevel] = useState(2);
  const [mode, setMode] = useState('learning');
  const [thinking, setThinking] = useState(false);
  const [moveNumber, setMoveNumber] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [moveLog, setMoveLog] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [stats, setStats] = useState({ excellent: 0, good: 0, interesting: 0, inaccuracy: 0, mistake: 0, blunder: 0, best: 0, brilliant: 0, total: 0 });
  const [showLevels, setShowLevels] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalSquares, setLegalSquares] = useState({});
  const [recorded, setRecorded] = useState(false);

  const aiMove = useCallback((currentFen) => {
    setThinking(true);
    setTimeout(() => {
      const move = getBestMove(currentFen, level);
      if (!move) { setThinking(false); return; }
      const g = new Chess(currentFen);
      const result = g.move({ from: move.from, to: move.to, promotion: 'q' });
      if (!result) { setThinking(false); return; }

      setGame(g); setFen(g.fen());
      setLastMove({ from: move.from, to: move.to });
      const mn = moveNumber + 1;
      setMoveNumber(mn);
      const mate = g.isCheckmate();
      const check = g.inCheck();
      setComment(getTutorComment({ move: result, prevFen: currentFen, fen: g.fen(), isAI: true, quality: null, moveNumber: mn, isCheck: check, isCheckmate: mate, isCoachMode: mode === 'coach' }));
      setMoveLog(l => [...l, { san: result.san, color: 'b', moveNum: mn }]);
      if (mate || g.isDraw()) { setGameOver(true); finishGame(mate ? 'loss' : 'draw'); }
      setThinking(false);
    }, 450);
  }, [level, mode, moveNumber]);

  const finishGame = useCallback((result) => {
    if (recorded || !progressHook) return;
    setRecorded(true);
    progressHook.recordGame(result, stats, level + 1);
  }, [recorded, progressHook, stats, level]);

  function makeMove(from, to) {
    if (gameOver || thinking || game.turn() !== 'w') return false;
    const prevFen = game.fen();
    const g = new Chess(prevFen);
    let result;
    try { result = g.move({ from, to, promotion: 'q' }); } catch { return false; }
    if (!result) return false;

    // Castle detection
    if (result.san === 'O-O' || result.san === 'O-O-O') {
      if (progressHook) progressHook.recordCastle();
    }

    setGame(g); setFen(g.fen());
    setLastMove({ from, to });
    setSelectedSquare(null); setLegalSquares({});
    const mn = moveNumber + 1;
    setMoveNumber(mn);
    const mate = g.isCheckmate();
    const check = g.inCheck();

    const quality = evaluateMoveQuality(prevFen, result);
    setStats(s => ({ ...s, total: s.total + 1, [quality.quality]: (s[quality.quality] || 0) + 1 }));

    setComment(getTutorComment({ move: result, prevFen, fen: g.fen(), isAI: false, quality: quality.quality, moveNumber: mn, isCheck: check, isCheckmate: mate, isCoachMode: mode === 'coach' }));
    setMoveLog(l => [...l, { san: result.san, color: 'w', quality: quality.quality, moveNum: mn }]);

    if (mate) { if (progressHook) progressHook.recordCheckmate(); setGameOver(true); finishGame('win'); return true; }
    if (g.isDraw()) { setGameOver(true); finishGame('draw'); return true; }

    if (mode !== 'beginner' || Math.random() > 0.25) {
      setTimeout(() => aiMove(g.fen()), 350);
    }
    return true;
  }

  function onDrop(from, to) { return makeMove(from, to); }

  function onSquareClick(square) {
    if (gameOver || thinking || game.turn() !== 'w') return;
    if (selectedSquare) {
      if (makeMove(selectedSquare, square)) return;
      setSelectedSquare(null); setLegalSquares({});
    }
    const piece = game.get(square);
    if (piece && piece.color === 'w') {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      const sq = {};
      moves.forEach(m => {
        sq[m.to] = { background: game.get(m.to) ? 'radial-gradient(circle, transparent 55%, #7b3fff88 55%)' : 'radial-gradient(circle, #7b3fff88 25%, transparent 25%)', borderRadius: '50%' };
      });
      setLegalSquares(sq);
    }
  }

  function handleHint(hlevel) {
    const moves = game.moves({ verbose: true });
    if (!moves.length) return null;
    if (hlevel === 1) {
      const ideas = ['Think about king safety, is your king protected?', 'Look for undefended pieces on both sides.', 'Develop a piece that hasn\'t moved yet.', 'Can you control more of the center?', 'Is any of your pieces under attack right now?'];
      return { level: 1, text: ideas[Math.floor(Math.random() * ideas.length)] };
    }
    if (hlevel === 2) {
      const caps = moves.filter(m => m.captured);
      if (caps.length) return { level: 2, text: `There's a capture available, look at your ${caps[0].piece === 'p' ? 'pawn' : caps[0].piece.toUpperCase()} on ${caps[0].from}.` };
      const checks = moves.filter(m => m.san.includes('+'));
      if (checks.length) return { level: 2, text: 'You have a check available. Find the move that checks the king.' };
      return { level: 2, text: 'Develop your least active piece toward the center.' };
    }
    const top = getTopMoves(game.fen(), 1);
    if (top[0]) return { level: 3, text: `Best move: ${top[0].san}, ${top[0].piece === 'p' ? 'pawn' : top[0].piece.toUpperCase()} ${top[0].from} to ${top[0].to}.` };
    return null;
  }

  function handleSuggest() {
    const top = getTopMoves(game.fen(), 3);
    if (!top.length) return;
    const names = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
    setComment({ tone: 'info2', label: 'Top 3 candidate moves', text: top.map((m, i) => `${i + 1}. ${m.san}, ${names[m.piece]} ${m.from} to ${m.to}${m.captured ? ` takes ${names[m.captured]}` : ''}`).join('\n'), tip: 'These are strong moves, but chess has many good paths. Trust your judgment.' });
  }

  function reset() {
    const g = new Chess();
    setGame(g); setFen(g.fen());
    setGameOver(false); setMoveNumber(0); setMoveLog([]); setLastMove(null);
    setStats({ excellent: 0, good: 0, interesting: 0, inaccuracy: 0, mistake: 0, blunder: 0, best: 0, brilliant: 0, total: 0 });
    setSelectedSquare(null); setLegalSquares({}); setRecorded(false);
    setComment({ tone: 'info', label: 'New game', text: `${MODES.find(m => m.id === mode)?.desc || ''} You play white. Make your first move.`, tip: 'Start with e4 or d4, the strongest opening moves.' });
  }

  function undo() {
    const g = new Chess(game.fen());
    if (g.history().length < 2) return;
    g.undo(); g.undo();
    setGame(g); setFen(g.fen());
    setMoveNumber(n => Math.max(0, n - 2));
    setMoveLog(l => l.slice(0, -2));
    setGameOver(false);
    setComment({ tone: 'info', label: 'Undone', text: 'Two moves undone. Think about a different approach.', tip: 'Replaying positions is how strong players learn from mistakes.' });
  }

  const squareStyles = useMemo(() => {
    const s = { ...legalSquares };
    if (lastMove) {
      s[lastMove.from] = { ...s[lastMove.from], background: '#2a1a4088' };
      s[lastMove.to] = { ...s[lastMove.to], background: '#3a2a6088' };
    }
    if (selectedSquare) s[selectedSquare] = { background: '#5a2fa066' };
    return s;
  }, [legalSquares, lastMove, selectedSquare]);

  const accuracy = stats.total > 0 ? Math.round(((stats.excellent + stats.good + stats.best + stats.brilliant) / stats.total) * 100) : 100;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#b8a8d4', padding: '1rem' }}>
      {/* Mode */}
      <div style={{ fontSize: '0.5rem', color: '#4a3a6a', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Mode</div>
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); reset(); }} style={{ background: mode === m.id ? '#1a1228' : '#0e0c18', border: `0.5px solid ${mode === m.id ? '#7b3fff' : '#2a1e42'}`, color: mode === m.id ? '#d0b0ff' : '#4a3a6a', fontFamily: 'inherit', fontSize: '0.55rem', padding: '0.3rem 0.55rem', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.05em' }}>{m.label}</button>
        ))}
      </div>

      {/* Level */}
      <button onClick={() => setShowLevels(p => !p)} style={{ background: '#0e0c18', border: '0.5px solid #3a2a5a', color: '#b8a8d4', fontFamily: 'inherit', fontSize: '0.6rem', padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showLevels ? '0.25rem' : '0.75rem' }}>
        <span><i className="ti ti-cpu" style={{ fontSize: '12px', marginRight: '6px' }} />Difficulty: Level {level + 1}, {LEVEL_ELO[level]}</span>
        <i className={`ti ${showLevels ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '12px' }} />
      </button>
      {showLevels && (
        <div style={{ background: '#0d0b16', border: '0.5px solid #2a1e42', borderRadius: '4px', marginBottom: '0.75rem', padding: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem' }}>
          {LEVEL_ELO.map((elo, i) => (
            <button key={i} onClick={() => { setLevel(i); setShowLevels(false); reset(); }} style={{ background: level === i ? '#1a1228' : 'transparent', border: `0.5px solid ${level === i ? '#7b3fff' : '#2a1e42'}`, color: level === i ? '#d0b0ff' : '#5a4a8a', fontFamily: 'inherit', fontSize: '0.5rem', padding: '0.3rem 0.2rem', borderRadius: '3px', cursor: 'pointer' }}>Lv{i + 1}<br />{elo}</button>
          ))}
        </div>
      )}

      {/* Stats bar */}
      {stats.total > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '0.55rem' }}>
          <div style={{ background: '#0e0c18', border: '0.5px solid #2a1e42', borderRadius: '4px', padding: '0.3rem 0.5rem', flex: 1, textAlign: 'center' }}><div style={{ color: '#7ecfc0' }}>{accuracy}%</div><div style={{ color: '#3a2a5a' }}>accuracy</div></div>
          {stats.blunder > 0 && <div style={{ background: '#1a0808', border: '0.5px solid #5a2a2a', borderRadius: '4px', padding: '0.3rem 0.5rem', flex: 1, textAlign: 'center' }}><div style={{ color: '#e07070' }}>{stats.blunder}</div><div style={{ color: '#5a2a2a' }}>blunders</div></div>}
          <div style={{ background: '#0a1a12', border: '0.5px solid #2a5a3a', borderRadius: '4px', padding: '0.3rem 0.5rem', flex: 1, textAlign: 'center' }}><div style={{ color: '#7ecfc0' }}>{stats.excellent + stats.good + stats.best + stats.brilliant}</div><div style={{ color: '#2a5a3a' }}>good</div></div>
        </div>
      )}

      {/* Turn */}
      <div style={{ fontSize: '0.6rem', padding: '0.3rem 0.7rem', borderRadius: '3px', marginBottom: '0.5rem', display: 'inline-block', background: game.turn() === 'w' ? '#1e1530' : '#0e0c18', border: `0.5px solid ${game.turn() === 'w' ? '#3a2a5a' : '#2a1e42'}`, color: game.turn() === 'w' ? '#d0b0ff' : '#7a5a9a' }}>
        {thinking ? 'Computer thinking...' : gameOver ? 'Game over' : game.turn() === 'w' ? 'Your turn' : "Computer's turn"}
      </div>

      {/* Board */}
      <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a1e42', marginBottom: '0.75rem' }}>
        <Chessboard position={fen} onPieceDrop={onDrop} onSquareClick={onSquareClick} boardOrientation="white" customDarkSquareStyle={{ backgroundColor: '#1e1530' }} customLightSquareStyle={{ backgroundColor: '#2a2040' }} customSquareStyles={squareStyles} animationDuration={200} arePiecesDraggable={!gameOver && !thinking && game.turn() === 'w'} />
      </div>

      <TutorBox comment={comment} onHint={handleHint} onSuggest={handleSuggest} moveNumber={moveNumber} />

      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={reset} style={cbtn}><i className="ti ti-refresh" style={{ fontSize: '13px' }} /> New game</button>
        <button onClick={undo} style={cbtn} disabled={moveNumber < 2}><i className="ti ti-arrow-back-up" style={{ fontSize: '13px' }} /> Undo</button>
      </div>

      {moveLog.length > 0 && (
        <div style={{ marginTop: '0.75rem', background: '#0a0814', border: '0.5px solid #1e1530', borderRadius: '4px', padding: '0.5rem 0.65rem', maxHeight: '90px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.5rem', color: '#3a2a5a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Move history</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {moveLog.map((m, i) => (
              <span key={i} style={{ fontSize: '0.6rem', color: m.color === 'w' ? (QCOLOR[m.quality] || '#b8a8d4') : '#7a5a9a', background: '#0d0b16', padding: '0.1rem 0.35rem', borderRadius: '2px' }}>
                {m.color === 'w' ? `${Math.ceil(m.moveNum / 2)}.` : ''}{m.san}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cbtn = { background: '#1a1228', border: '0.5px solid #3a2a5a', color: '#b8a8d4', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.08em', padding: '0.38rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' };
