import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lithe_chess_progress';

const DEFAULT_PROGRESS = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  totalMoves: 0,
  excellentMoves: 0,
  goodMoves: 0,
  inaccuracies: 0,
  mistakes: 0,
  blunders: 0,
  puzzlesSolved: 0,
  puzzlesAttempted: 0,
  puzzleStreak: 0,
  bestPuzzleStreak: 0,
  lessonsCompleted: [],
  achievements: [],
  lastPlayed: null,
  dailyStreak: 0,
  highestLevelBeaten: 0,
  firstCheckmate: false,
  firstCastle: false,
};

const ACHIEVEMENTS = [
  { id: 'first_game', name: 'First Steps', desc: 'Play your first game', icon: 'ti-chess' },
  { id: 'first_win', name: 'Victory', desc: 'Win your first game', icon: 'ti-trophy' },
  { id: 'first_checkmate', name: 'Checkmate!', desc: 'Deliver your first checkmate', icon: 'ti-crown' },
  { id: 'first_castle', name: 'Fortress', desc: 'Castle for the first time', icon: 'ti-shield' },
  { id: 'puzzle_5', name: 'Puzzle Solver', desc: 'Solve 5 puzzles', icon: 'ti-puzzle' },
  { id: 'puzzle_streak_3', name: 'On Fire', desc: 'Solve 3 puzzles in a row', icon: 'ti-flame' },
  { id: 'no_blunders', name: 'Clean Game', desc: 'Finish a game with no blunders', icon: 'ti-sparkles' },
  { id: 'games_10', name: 'Dedicated', desc: 'Play 10 games', icon: 'ti-star' },
  { id: 'beat_level_5', name: 'Rising Star', desc: 'Beat level 5 AI', icon: 'ti-arrow-up' },
  { id: 'lesson_5', name: 'Student', desc: 'Complete 5 lessons', icon: 'ti-book' },
];

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...DEFAULT_PROGRESS, ...saved };
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }, [progress]);

  const unlockAchievement = useCallback((id) => {
    setProgress(p => {
      if (p.achievements.includes(id)) return p;
      return { ...p, achievements: [...p.achievements, id] };
    });
  }, []);

  const recordGame = useCallback((result, moveStats, levelBeaten) => {
    setProgress(p => {
      const next = {
        ...p,
        gamesPlayed: p.gamesPlayed + 1,
        wins: p.wins + (result === 'win' ? 1 : 0),
        losses: p.losses + (result === 'loss' ? 1 : 0),
        draws: p.draws + (result === 'draw' ? 1 : 0),
        totalMoves: p.totalMoves + (moveStats.total || 0),
        excellentMoves: p.excellentMoves + (moveStats.excellent || 0),
        goodMoves: p.goodMoves + (moveStats.good || 0),
        inaccuracies: p.inaccuracies + (moveStats.inaccuracy || 0),
        mistakes: p.mistakes + (moveStats.mistake || 0),
        blunders: p.blunders + (moveStats.blunder || 0),
        lastPlayed: new Date().toISOString(),
        highestLevelBeaten: result === 'win' ? Math.max(p.highestLevelBeaten, levelBeaten || 0) : p.highestLevelBeaten,
      };
      // Check achievements
      const newAch = [...p.achievements];
      if (!newAch.includes('first_game')) newAch.push('first_game');
      if (result === 'win' && !newAch.includes('first_win')) newAch.push('first_win');
      if (next.gamesPlayed >= 10 && !newAch.includes('games_10')) newAch.push('games_10');
      if (result === 'win' && (levelBeaten || 0) >= 4 && !newAch.includes('beat_level_5')) newAch.push('beat_level_5');
      if ((moveStats.blunder || 0) === 0 && moveStats.total > 10 && !newAch.includes('no_blunders')) newAch.push('no_blunders');
      next.achievements = newAch;
      return next;
    });
  }, []);

  const recordPuzzle = useCallback((solved) => {
    setProgress(p => {
      const streak = solved ? p.puzzleStreak + 1 : 0;
      const next = {
        ...p,
        puzzlesAttempted: p.puzzlesAttempted + 1,
        puzzlesSolved: p.puzzlesSolved + (solved ? 1 : 0),
        puzzleStreak: streak,
        bestPuzzleStreak: Math.max(p.bestPuzzleStreak, streak),
      };
      const newAch = [...p.achievements];
      if (next.puzzlesSolved >= 5 && !newAch.includes('puzzle_5')) newAch.push('puzzle_5');
      if (streak >= 3 && !newAch.includes('puzzle_streak_3')) newAch.push('puzzle_streak_3');
      next.achievements = newAch;
      return next;
    });
  }, []);

  const recordCheckmate = useCallback(() => {
    setProgress(p => {
      if (p.firstCheckmate) return p;
      const newAch = p.achievements.includes('first_checkmate') ? p.achievements : [...p.achievements, 'first_checkmate'];
      return { ...p, firstCheckmate: true, achievements: newAch };
    });
  }, []);

  const recordCastle = useCallback(() => {
    setProgress(p => {
      if (p.firstCastle) return p;
      const newAch = p.achievements.includes('first_castle') ? p.achievements : [...p.achievements, 'first_castle'];
      return { ...p, firstCastle: true, achievements: newAch };
    });
  }, []);

  const completeLesson = useCallback((lessonId) => {
    setProgress(p => {
      if (p.lessonsCompleted.includes(lessonId)) return p;
      const done = [...p.lessonsCompleted, lessonId];
      const newAch = [...p.achievements];
      if (done.length >= 5 && !newAch.includes('lesson_5')) newAch.push('lesson_5');
      return { ...p, lessonsCompleted: done, achievements: newAch };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, []);

  const accuracy = progress.totalMoves > 0
    ? Math.round(((progress.excellentMoves + progress.goodMoves) / progress.totalMoves) * 100)
    : 0;

  const estimatedElo = Math.min(2000, 400 + progress.highestLevelBeaten * 130 + accuracy * 3 + progress.puzzlesSolved * 10);

  return {
    progress, accuracy, estimatedElo,
    recordGame, recordPuzzle, recordCheckmate, recordCastle,
    completeLesson, unlockAchievement, resetProgress,
    ACHIEVEMENTS,
  };
}
