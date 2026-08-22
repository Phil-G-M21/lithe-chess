import React from 'react';

export default function ProgressDashboard({ progressHook }) {
  const { progress, accuracy, estimatedElo, ACHIEVEMENTS, resetProgress } = progressHook;

  const winRate = progress.gamesPlayed > 0 ? Math.round((progress.wins / progress.gamesPlayed) * 100) : 0;
  const puzzleRate = progress.puzzlesAttempted > 0 ? Math.round((progress.puzzlesSolved / progress.puzzlesAttempted) * 100) : 0;

  const StatCard = ({ label, value, sub, color = '#d0b0ff' }) => (
    <div style={{ background: '#0e0c18', border: '0.5px solid #2a1e42', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.4rem', color, fontWeight: 500, fontFamily: "'Cinzel', serif" }}>{value}</div>
      <div style={{ fontSize: '0.52rem', color: '#5a4a8a', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.55rem', color: '#3a2a5a', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '1rem', fontFamily: "'IBM Plex Mono', monospace", color: '#b8a8d4' }}>
      <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: '#4a3a6a', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Your progress <span style={{ flex: 1, height: '0.5px', background: '#1e1530' }} />
      </div>

      {/* Estimated Elo hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a0f2e, #0e0c18)', border: '0.5px solid #5a2fa0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.55rem', color: '#7a5a9a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Estimated Rating</div>
        <div style={{ fontSize: '2.5rem', color: '#d0b0ff', fontFamily: "'Cinzel', serif", fontWeight: 600, lineHeight: 1 }}>{estimatedElo}</div>
        <div style={{ fontSize: '0.58rem', color: '#5a4a8a', marginTop: '0.4rem' }}>
          {estimatedElo < 600 ? 'Beginner' : estimatedElo < 1000 ? 'Improving' : estimatedElo < 1400 ? 'Intermediate' : estimatedElo < 1800 ? 'Advanced' : 'Expert'}
        </div>
      </div>

      {/* Game stats */}
      <div style={{ fontSize: '0.55rem', color: '#5a4a8a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Games</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <StatCard label="Played" value={progress.gamesPlayed} color="#d0b0ff" />
        <StatCard label="Won" value={progress.wins} color="#7ecfc0" />
        <StatCard label="Win Rate" value={`${winRate}%`} color="#f0c060" />
      </div>

      {/* Accuracy + moves */}
      <div style={{ fontSize: '0.55rem', color: '#5a4a8a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Move quality</div>
      <div style={{ background: '#0e0c18', border: '0.5px solid #2a1e42', borderRadius: '6px', padding: '0.85rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.62rem', color: '#b8a8d4' }}>Overall accuracy</span>
          <span style={{ fontSize: '0.7rem', color: '#7ecfc0', fontWeight: 500 }}>{accuracy}%</span>
        </div>
        <div style={{ height: '4px', background: '#1e1530', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.75rem' }}>
          <div style={{ height: '100%', width: `${accuracy}%`, background: 'linear-gradient(90deg, #7b3fff, #7ecfc0)', borderRadius: '2px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.58rem' }}>
          <StatRow label="Excellent" value={progress.excellentMoves} color="#7ecfc0" />
          <StatRow label="Good" value={progress.goodMoves} color="#8ab8e8" />
          <StatRow label="Inaccuracies" value={progress.inaccuracies} color="#f0c060" />
          <StatRow label="Mistakes" value={progress.mistakes} color="#e09070" />
          <StatRow label="Blunders" value={progress.blunders} color="#e07070" />
          <StatRow label="Total moves" value={progress.totalMoves} color="#b8a8d4" />
        </div>
      </div>

      {/* Puzzles */}
      <div style={{ fontSize: '0.55rem', color: '#5a4a8a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Puzzles</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <StatCard label="Solved" value={progress.puzzlesSolved} color="#d0b0ff" />
        <StatCard label="Accuracy" value={`${puzzleRate}%`} color="#7ecfc0" />
        <StatCard label="Best Streak" value={progress.bestPuzzleStreak} color="#f0c060" />
      </div>

      {/* Achievements */}
      <div style={{ fontSize: '0.55rem', color: '#5a4a8a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Achievements ({progress.achievements.length} / {ACHIEVEMENTS.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {ACHIEVEMENTS.map(a => {
          const unlocked = progress.achievements.includes(a.id);
          return (
            <div key={a.id} style={{
              background: unlocked ? '#1a1228' : '#0a0814',
              border: `0.5px solid ${unlocked ? '#5a2fa0' : '#1e1530'}`,
              borderRadius: '6px', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: unlocked ? 1 : 0.4,
            }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: unlocked ? '#2a1a48' : '#0e0c18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${a.icon}`} style={{ fontSize: '15px', color: unlocked ? '#d0b0ff' : '#3a2a5a' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: unlocked ? '#d0b0ff' : '#4a3a6a', fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: '0.5rem', color: '#4a3a6a', marginTop: '0.1rem' }}>{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset */}
      <button onClick={() => { if (window.confirm('Reset all progress? This cannot be undone.')) resetProgress(); }} style={{
        background: 'transparent', border: '0.5px solid #5a2a2a', color: '#8a4a4a',
        fontFamily: 'inherit', fontSize: '0.55rem', padding: '0.4rem 0.75rem', borderRadius: '4px',
        cursor: 'pointer', width: '100%',
      }}>
        Reset all progress
      </button>
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.4rem', background: '#0a0814', borderRadius: '3px' }}>
      <span style={{ color: '#5a4a8a' }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}
