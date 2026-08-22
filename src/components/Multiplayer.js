import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Peer from 'peerjs';

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
const PREFIX = 'lithe-chess-';

function parseCode(input) {
  const v = input.trim();
  if (v.includes('join=')) {
    try { return new URL(v).searchParams.get('join').toUpperCase(); } catch {}
    const m = v.match(/join=([A-Za-z0-9]+)/);
    if (m) return m[1].toUpperCase();
  }
  return v.toUpperCase();
}

export default function Multiplayer({ autoJoinId }) {
  const [phase, setPhase] = useState('menu'); // menu | hosting | joining | playing
  const [myColor, setMyColor] = useState('w');
  const [code, setCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [status, setStatus] = useState('');
  const [connected, setConnected] = useState(false);
  const [fen, setFen] = useState(new Chess().fen());
  const [gameState, setGameState] = useState({ over: false, msg: '' });
  const [copied, setCopied] = useState('');

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const gameRef = useRef(new Chess());

  const cleanup = useCallback(() => {
    try { connRef.current && connRef.current.close(); } catch {}
    try { peerRef.current && peerRef.current.destroy(); } catch {}
    connRef.current = null; peerRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const refresh = useCallback(() => setFen(gameRef.current.fen()), []);

  const evaluateEnd = useCallback(() => {
    const g = gameRef.current;
    if (g.isCheckmate()) {
      const loserIsMe = g.turn() === myColor;
      setGameState({ over: true, msg: loserIsMe ? 'Checkmate. You lost.' : 'Checkmate. You won.' });
    } else if (g.isDraw() || g.isStalemate()) {
      setGameState({ over: true, msg: 'Draw.' });
    }
  }, [myColor]);

  const handleData = useCallback((data) => {
    if (!data || typeof data !== 'object') return;
    if (data.type === 'move') {
      try {
        gameRef.current.move({ from: data.from, to: data.to, promotion: 'q' });
        refresh();
        evaluateEnd();
      } catch {}
    } else if (data.type === 'reset') {
      gameRef.current = new Chess();
      refresh();
      setGameState({ over: false, msg: '' });
    } else if (data.type === 'resign') {
      setGameState({ over: true, msg: 'Your opponent resigned. You win.' });
    }
  }, [refresh, evaluateEnd]);

  const wireConnection = useCallback((conn, color) => {
    connRef.current = conn;
    conn.on('open', () => {
      setConnected(true);
      setPhase('playing');
      setMyColor(color);
      gameRef.current = new Chess();
      refresh();
      setStatus('');
    });
    conn.on('data', handleData);
    conn.on('close', () => {
      setConnected(false);
      setGameState({ over: true, msg: 'Your opponent disconnected.' });
    });
    conn.on('error', () => setStatus('Connection error. Try again.'));
  }, [handleData, refresh]);

  const host = useCallback(() => {
    cleanup();
    const newCode = makeCode();
    setCode(newCode);
    setPhase('hosting');
    setStatus('Setting up your game...');
    const peer = new Peer(PREFIX + newCode);
    peerRef.current = peer;
    peer.on('open', () => setStatus('Waiting for your opponent to join...'));
    peer.on('connection', (conn) => wireConnection(conn, 'w'));
    peer.on('error', (err) => {
      if (err && err.type === 'unavailable-id') { setStatus('That code was taken. Trying another...'); setTimeout(host, 300); }
      else setStatus('Could not reach the connection service. Check your internet and try again.');
    });
  }, [cleanup, wireConnection]);

  const join = useCallback((rawCode) => {
    const target = parseCode(rawCode || joinInput);
    if (!target) { setStatus('Enter a game code first.'); return; }
    cleanup();
    setPhase('joining');
    setStatus('Connecting to the game...');
    const peer = new Peer();
    peerRef.current = peer;
    peer.on('open', () => {
      const conn = peer.connect(PREFIX + target, { reliable: true });
      wireConnection(conn, 'b');
      setTimeout(() => {
        if (!connRef.current || !connRef.current.open) setStatus('No game found with that code, or the host is offline.');
      }, 6000);
    });
    peer.on('error', () => setStatus('No game found with that code, or the host is offline.'));
  }, [joinInput, cleanup, wireConnection]);

  useEffect(() => {
    if (autoJoinId && phase === 'menu') {
      setJoinInput(autoJoinId);
      join(autoJoinId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoJoinId]);

  function onDrop(from, to) {
    if (!connected || gameState.over) return false;
    const g = gameRef.current;
    if (g.turn() !== myColor) return false;
    let move;
    try { move = g.move({ from, to, promotion: 'q' }); } catch { return false; }
    if (!move) return false;
    refresh();
    if (connRef.current && connRef.current.open) connRef.current.send({ type: 'move', from, to });
    evaluateEnd();
    return true;
  }

  function rematch() {
    gameRef.current = new Chess();
    refresh();
    setGameState({ over: false, msg: '' });
    if (connRef.current && connRef.current.open) connRef.current.send({ type: 'reset' });
  }

  function resign() {
    if (connRef.current && connRef.current.open) connRef.current.send({ type: 'resign' });
    setGameState({ over: true, msg: 'You resigned.' });
  }

  function leave() {
    cleanup();
    setPhase('menu'); setConnected(false); setStatus(''); setCode('');
    gameRef.current = new Chess(); refresh(); setGameState({ over: false, msg: '' });
  }

  function copy(text, label) {
    try {
      navigator.clipboard.writeText(text);
      setCopied(label); setTimeout(() => setCopied(''), 1500);
    } catch {}
  }

  const shareLink = `${window.location.origin}${window.location.pathname}?join=${code}`;
  const g = gameRef.current;
  const myTurn = connected && !gameState.over && g.turn() === myColor;

  return (
    <div style={{ padding: '1rem', fontFamily: "'IBM Plex Mono', monospace", color: '#b8a8d4' }}>
      <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: '#4a3a6a', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Play together <span style={{ flex: 1, height: '0.5px', background: '#1e1530' }} />
      </div>

      {phase === 'menu' && (
        <div>
          <p style={{ fontSize: '0.68rem', color: '#7a5a9a', lineHeight: 1.85, marginBottom: '1rem' }}>
            Play a live game against each other. One of you creates a game and shares the link or code, the other joins. You both need to be online at the same time.
          </p>
          <button onClick={host} style={{ ...bigBtn('#2a1a48', '#7b3fff', '#d0b0ff'), marginBottom: '0.6rem' }}>
            <i className="ti ti-plus" style={{ fontSize: '15px' }} /> Create a game
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.55rem', color: '#3a2a5a', margin: '0.6rem 0' }}>or join with a code</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={joinInput} onChange={e => setJoinInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && join()} placeholder="Enter game code" style={{ flex: 1, background: '#0a0814', border: '0.5px solid #2a1e42', color: '#d0b0ff', fontFamily: 'inherit', fontSize: '0.72rem', letterSpacing: '0.12em', padding: '0.6rem 0.75rem', borderRadius: '6px', outline: 'none', textTransform: 'uppercase' }} />
            <button onClick={() => join()} style={bigBtn('#1a1228', '#5a2fa0', '#a07ad0', true)}>
              <i className="ti ti-arrow-right" style={{ fontSize: '15px' }} />
            </button>
          </div>
        </div>
      )}

      {phase === 'hosting' && !connected && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #14092a, #0a0814)', border: '0.5px solid #5a2fa0', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.55rem', color: '#7a5a9a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Your game code</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '2.2rem', color: '#d0b0ff', letterSpacing: '0.3em', fontWeight: 600, textIndent: '0.3em' }}>{code}</div>
          </div>
          <button onClick={() => copy(code, 'code')} style={{ ...bigBtn('#1a1228', '#3a2a5a', '#b8a8d4'), marginBottom: '0.5rem' }}>
            <i className="ti ti-copy" style={{ fontSize: '14px' }} /> {copied === 'code' ? 'Code copied' : 'Copy code'}
          </button>
          <button onClick={() => copy(shareLink, 'link')} style={{ ...bigBtn('#1a1228', '#3a2a5a', '#b8a8d4'), marginBottom: '0.85rem' }}>
            <i className="ti ti-link" style={{ fontSize: '14px' }} /> {copied === 'link' ? 'Link copied' : 'Copy invite link'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.65rem', color: '#7a5a9a', padding: '0.5rem' }}>
            <span className="pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f0c060' }} />
            {status}
          </div>
          <button onClick={leave} style={{ ...bigBtn('transparent', '#3a2a5a', '#5a4a8a'), marginTop: '0.4rem' }}>Cancel</button>
        </div>
      )}

      {phase === 'joining' && !connected && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <span className="pulse" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#7b3fff', marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.72rem', color: '#a07ad0', lineHeight: 1.8 }}>{status}</p>
          <button onClick={leave} style={{ ...bigBtn('transparent', '#3a2a5a', '#5a4a8a'), marginTop: '1.5rem' }}>Back</button>
        </div>
      )}

      {phase === 'playing' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.6rem', color: myColor === 'w' ? '#d0b0ff' : '#7a5a9a', background: '#0e0c18', border: '0.5px solid #2a1e42', padding: '0.25rem 0.55rem', borderRadius: '3px' }}>
              You play {myColor === 'w' ? 'White' : 'Black'}
            </span>
            <span style={{ fontSize: '0.62rem', padding: '0.25rem 0.6rem', borderRadius: '3px', background: myTurn ? '#1e1530' : '#0a0814', border: `0.5px solid ${myTurn ? '#5a2fa0' : '#1e1530'}`, color: myTurn ? '#d0b0ff' : '#5a4a8a', marginLeft: 'auto' }}>
              {gameState.over ? 'Game over' : myTurn ? 'Your move' : "Opponent's move"}
            </span>
          </div>

          <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a1e42', marginBottom: '0.6rem' }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={myColor === 'w' ? 'white' : 'black'}
              arePiecesDraggable={myTurn}
              customDarkSquareStyle={{ backgroundColor: '#1e1530' }}
              customLightSquareStyle={{ backgroundColor: '#2a2040' }}
              animationDuration={200}
            />
          </div>

          {g.inCheck() && !gameState.over && (
            <div style={{ background: '#1a0e08', border: '0.5px solid #6a4020', borderRadius: '5px', padding: '0.5rem 0.7rem', fontSize: '0.66rem', color: '#e08060', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: '13px' }} /> Check
            </div>
          )}

          {gameState.over && (
            <div style={{ background: '#0d0b1a', border: '0.5px solid #5a2fa0', borderRadius: '6px', padding: '0.85rem', textAlign: 'center', marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#d0b0ff', fontFamily: "'Cinzel', serif" }}>{gameState.msg}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {gameState.over
              ? <button onClick={rematch} style={{ ...bigBtn('#2a1a48', '#7b3fff', '#d0b0ff'), flex: 1 }}><i className="ti ti-refresh" style={{ fontSize: '14px' }} /> Rematch</button>
              : <button onClick={resign} style={{ ...bigBtn('#1a0a0a', '#5a2a2a', '#c07070'), flex: 1 }}><i className="ti ti-flag" style={{ fontSize: '14px' }} /> Resign</button>}
            <button onClick={leave} style={bigBtn('#1a1228', '#3a2a5a', '#7a5a9a')}><i className="ti ti-door-exit" style={{ fontSize: '14px' }} /> Leave</button>
          </div>
        </div>
      )}
    </div>
  );
}

function bigBtn(bg, border, color, square) {
  return { background: bg, border: `0.5px solid ${border}`, color, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.06em', padding: square ? '0 0.9rem' : '0.7rem', borderRadius: '6px', cursor: 'pointer', width: square ? 'auto' : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' };
}
