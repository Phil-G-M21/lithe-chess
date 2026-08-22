import React, { useState, useEffect } from 'react';
import './App.css';
import ChessGame from './components/ChessGame';
import PieceGuide from './components/PieceGuide';
import PuzzleMode from './components/PuzzleMode';
import OpeningTrainer from './components/OpeningTrainer';
import ProgressDashboard from './components/ProgressDashboard';
import SketchPad from './components/SketchPad';
import CasesPuzzle from './components/CasesPuzzle';
import Multiplayer from './components/Multiplayer';
import { useProgress } from './hooks/useProgress';

const QUOTES = [
  { t: "A lesson without pain is meaningless. That's because no one can gain without sacrificing something.", s: "Fullmetal Alchemist" },
  { t: "The world is not beautiful, therefore it is.", s: "Kino's Journey" },
  { t: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", s: "Kenshin" },
  { t: "It's not the face that makes someone a monster, it's the choices they make with their lives.", s: "Naruto" },
  { t: "Fear is not evil. It tells you what weakness is. And once you know your weakness, you can become stronger.", s: "Fairy Tail" },
  { t: "If you don't take risks, you can't create a future.", s: "One Piece" },
  { t: "Power comes in response to a need, not a desire.", s: "Dragon Ball" },
  { t: "People's lives don't end when they die. It ends when they lose faith.", s: "Naruto" },
  { t: "A dropout will beat a genius through hard work.", s: "Naruto" },
  { t: "Being weak is nothing to be ashamed of. Staying weak is.", s: "Fuegoleon, Black Clover" },
  { t: "The moment you think of giving up, think of the reason why you held on so long.", s: "Natsu, Fairy Tail" },
  { t: "Hard work is worthless for those that don't believe in themselves.", s: "Rock Lee, Naruto" },
];

const FACTS = [
  "A day on Venus is longer than its year. It rotates so slowly that one spin takes 243 Earth days, while its orbit takes only 225.",
  "Neutron stars are so dense that a sugar-cube-sized amount of their material would weigh about a billion tons on Earth.",
  "There are more possible chess games than atoms in the observable universe. The Shannon number estimates 10^120 games.",
  "Octopuses have three hearts and blue blood. Two hearts pump to the gills, one to the body.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth, so you always see the Sun as it was in the past.",
  "The universe is expanding, and at its farthest edges space stretches so fast that distant galaxies recede faster than light.",
  "Bananas are slightly radioactive. They contain potassium-40, though you would need to eat millions at once for any harm.",
  "Time moves faster for your head than your feet. Gravity slows time, so being farther from Earth's center ages you slightly quicker.",
  "A single bolt of lightning is five times hotter than the surface of the Sun, reaching around 30,000 kelvin.",
  "Tardigrades can survive the vacuum of space, intense radiation, and being frozen to near absolute zero.",
];

const TABS = [
  { id: 'daily', label: 'Daily', icon: 'ti-sparkles' },
  { id: 'chess', label: 'Play', icon: 'ti-chess-knight' },
  { id: 'puzzles', label: 'Puzzles', icon: 'ti-puzzle' },
  { id: 'openings', label: 'Openings', icon: 'ti-book-2' },
  { id: 'guide', label: 'Learn', icon: 'ti-school' },
  { id: 'versus', label: 'Versus', icon: 'ti-users' },
  { id: 'cases', label: 'Cases', icon: 'ti-gavel' },
  { id: 'progress', label: 'Progress', icon: 'ti-chart-line' },
  { id: 'draw', label: 'Draw', icon: 'ti-brush' },
  { id: 'quiz', label: 'Quiz', icon: 'ti-help-hexagon' },
  { id: 'world', label: 'World', icon: 'ti-planet' },
];

const QUIZ = [
  { q: "Which anime has alchemy built on the law of equivalent exchange?", opts: ["Bleach", "Fullmetal Alchemist", "Death Note", "One Piece"], a: 1 },
  { q: "In chess, which piece can only move diagonally?", opts: ["Rook", "Knight", "Bishop", "Pawn"], a: 2 },
  { q: "What is the strongest first move for controlling the center?", opts: ["a4", "e4", "h4", "Na3"], a: 1 },
  { q: "Which sci-fi concept bends space to travel faster than light?", opts: ["Warp drive", "Cryosleep", "Terraforming", "Cloning"], a: 0 },
  { q: "How many hearts does an octopus have?", opts: ["One", "Two", "Three", "Four"], a: 2 },
  { q: "Who is this whole app secretly built for?", opts: ["A stranger", "Aba Kwansma. Lithe", "Nobody", "A test user"], a: 1 },
];

const SECRET_MESSAGE = "You move through rooms like you already know how they end, quietly, with intention. That's rare. This was built for you because you deserved something that felt like it.";

function dayIndex(len) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  return day % len;
}

function getJoinId() {
  try { return new URLSearchParams(window.location.search).get('join'); } catch { return null; }
}

export default function App() {
  const joinId = getJoinId();
  const [tab, setTab] = useState(joinId ? 'versus' : 'daily');
  const progressHook = useProgress();

  return (
    <div className="app-root">
      <div className="app-shell">
        <TopBar />
        <div className="app-body">
          {tab === 'daily' && <Daily />}
          {tab === 'chess' && <ChessGame progressHook={progressHook} />}
          {tab === 'puzzles' && <PuzzleMode onSolve={(solved) => progressHook.recordPuzzle(solved)} />}
          {tab === 'openings' && <OpeningTrainer />}
          {tab === 'guide' && <PieceGuide progressHook={progressHook} />}
          {tab === 'versus' && <Multiplayer autoJoinId={joinId} />}
          {tab === 'cases' && <CasesPuzzle />}
          {tab === 'progress' && <ProgressDashboard progressHook={progressHook} />}
          {tab === 'draw' && <SketchPad />}
          {tab === 'quiz' && <Quiz />}
          {tab === 'world' && <World />}
        </div>
        <nav className="bottom-nav">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`nav-btn ${tab === t.id ? 'active' : ''}`}>
              <i className={`ti ${t.icon}`} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-mark"><span className="mark-glyph">♟</span></div>
      <div className="topbar-title">
        <div className="title-main">LITHE</div>
        <div className="title-sub">for Aba Kwansma</div>
      </div>
      <div className="topbar-pulse pulse" />
    </header>
  );
}

function Daily() {
  const quote = QUOTES[dayIndex(QUOTES.length)];
  const fact = FACTS[dayIndex(FACTS.length)];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="panel">
      <div className="sec-label">Today <span className="rule" /></div>
      <div className="daily-date">{today}</div>
      <div className="quote-block">
        <div className="quote-mark">"</div>
        <p className="quote-text">{quote.t}</p>
        <div className="quote-source">, {quote.s}</div>
      </div>
      <div className="sec-label" style={{ marginTop: '1.5rem' }}>One thing about the universe <span className="rule" /></div>
      <div className="fact-block">
        <i className="ti ti-planet fact-icon" />
        <p>{fact}</p>
      </div>
      <div className="tags-row">
        <span className="tag">anime</span><span className="tag">sci-fi</span><span className="tag">chess</span><span className="tag">art</span>
      </div>
    </div>
  );
}

function Quiz() {
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const question = QUIZ[i];

  function pick(idx) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question.a) setScore(s => s + 1);
    setTimeout(() => {
      if (i + 1 < QUIZ.length) { setI(i + 1); setSelected(null); }
      else setDone(true);
    }, 900);
  }
  function restart() { setI(0); setSelected(null); setScore(0); setDone(false); }

  if (done) {
    return (
      <div className="panel">
        <div className="sec-label">Quiz complete <span className="rule" /></div>
        <div className="quiz-score">
          <div className="score-num">{score} / {QUIZ.length}</div>
          <div className="score-label">{score === QUIZ.length ? 'Perfect' : score >= 4 ? 'Well done' : 'Keep going'}</div>
        </div>
        <div className="secret-message">
          <div className="secret-label">A message</div>
          <p>{SECRET_MESSAGE}</p>
          <div className="secret-sign">, from Phil</div>
        </div>
        <button className="btn-primary" onClick={restart}><i className="ti ti-refresh" /> Play again</button>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="sec-label">Quiz, {i + 1} of {QUIZ.length} <span className="rule" /></div>
      <div className="quiz-progress"><div className="quiz-progress-fill" style={{ width: `${(i / QUIZ.length) * 100}%` }} /></div>
      <div className="quiz-question">{question.q}</div>
      <div className="quiz-options">
        {question.opts.map((opt, idx) => {
          let cls = 'quiz-opt';
          if (selected !== null) {
            if (idx === question.a) cls += ' correct';
            else if (idx === selected) cls += ' wrong';
          }
          return (
            <button key={idx} className={cls} onClick={() => pick(idx)}>
              <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>{opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function World() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lithe_world')) || []; } catch { return []; }
  });
  const [type, setType] = useState('show');
  const [text, setText] = useState('');
  useEffect(() => { try { localStorage.setItem('lithe_world', JSON.stringify(items)); } catch {} }, [items]);

  const TYPES = { show: { label: 'Show', icon: 'ti-device-tv', color: '#d0b0ff' }, quote: { label: 'Quote', icon: 'ti-quote', color: '#f9a8c9' }, char: { label: 'Character', icon: 'ti-user-star', color: '#7ecfc0' } };

  function add() { if (!text.trim()) return; setItems([{ id: Date.now(), type, text: text.trim() }, ...items]); setText(''); }
  function remove(id) { setItems(items.filter(it => it.id !== id)); }

  return (
    <div className="panel">
      <div className="sec-label">Your world <span className="rule" /></div>
      <p className="world-intro">A private space for the shows you love, the quotes that stay with you, and the characters you would defend to the end.</p>
      <div className="world-type-row">
        {Object.entries(TYPES).map(([k, v]) => (
          <button key={k} className={`world-type ${type === k ? 'active' : ''}`} onClick={() => setType(k)} style={type === k ? { borderColor: v.color, color: v.color } : {}}>
            <i className={`ti ${v.icon}`} /> {v.label}
          </button>
        ))}
      </div>
      <div className="world-input-row">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={`Add a ${TYPES[type].label.toLowerCase()}...`} className="world-input" />
        <button className="world-add" onClick={add}><i className="ti ti-plus" /></button>
      </div>
      <div className="world-list">
        {items.length === 0 && <div className="world-empty">Nothing yet. Start building your world above.</div>}
        {items.map(it => (
          <div key={it.id} className="world-item" style={{ borderLeftColor: TYPES[it.type].color }}>
            <i className={`ti ${TYPES[it.type].icon}`} style={{ color: TYPES[it.type].color }} />
            <span>{it.text}</span>
            <button onClick={() => remove(it.id)} className="world-remove"><i className="ti ti-x" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
