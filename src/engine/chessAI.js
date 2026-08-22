import { Chess } from 'chess.js';

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables (from white's perspective, flipped for black)
const PST = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20
  ],
  kEnd: [
    -50, -40, -30, -20, -20, -30, -40, -50,
    -30, -20, -10, 0, 0, -10, -20, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -30, 0, 0, 0, 0, -30, -30,
    -50, -30, -30, -30, -30, -30, -30, -50
  ]
};

function isEndgame(board) {
  let queens = 0, pieces = 0;
  for (const row of board) {
    for (const p of row) {
      if (!p) continue;
      if (p.type === 'q') queens++;
      if (p.type !== 'p' && p.type !== 'k') pieces++;
    }
  }
  return queens === 0 || pieces <= 6;
}

function sqToIdx(square, color) {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  // White reads table top-to-bottom; flip for black
  return color === 'w' ? (7 - rank) * 8 + file : rank * 8 + file;
}

export function evaluate(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -99999 : 99999;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  const board = chess.board();
  const endgame = isEndgame(board);
  let score = 0;
  let whiteBishops = 0, blackBishops = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type];
      const sq = String.fromCharCode(97 + c) + (8 - r);
      let table = PST[piece.type];
      if (piece.type === 'k' && endgame) table = PST.kEnd;
      const idx = sqToIdx(sq, piece.color);
      const posBonus = table[idx] || 0;
      const total = val + posBonus;
      score += piece.color === 'w' ? total : -total;
      if (piece.type === 'b') {
        if (piece.color === 'w') whiteBishops++; else blackBishops++;
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;

  // Mobility (small bonus for having more moves)
  const mobility = chess.moves().length;
  score += chess.turn() === 'w' ? mobility * 2 : -mobility * 2;

  return score;
}

// Quiescence search, only look at captures to avoid horizon effect
function quiesce(chess, alpha, beta, maximizing) {
  const standPat = evaluate(chess);
  if (maximizing) {
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (beta > standPat) beta = standPat;
  }

  const captures = chess.moves({ verbose: true }).filter(m => m.captured);
  for (const move of captures) {
    chess.move(move);
    const score = quiesce(chess, alpha, beta, !maximizing);
    chess.undo();
    if (maximizing) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }
  return maximizing ? alpha : beta;
}

function orderMoves(moves) {
  // MVV-LVA: prioritize captures of valuable pieces by cheap pieces
  return moves.sort((a, b) => {
    const aScore = (a.captured ? PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece] : 0) + (a.san.includes('+') ? 50 : 0);
    const bScore = (b.captured ? PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece] : 0) + (b.san.includes('+') ? 50 : 0);
    return bScore - aScore;
  });
}

function minimax(chess, depth, alpha, beta, maximizing) {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return maximizing ? -99999 + (10 - depth) : 99999 - (10 - depth);
    return 0;
  }
  if (depth === 0) return quiesce(chess, alpha, beta, maximizing);

  const moves = orderMoves(chess.moves({ verbose: true }));

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// Level config: 1-15, mapping to depth and randomness
const LEVEL_CONFIG = [
  { depth: 1, randomness: 0.85, blunderChance: 0.6 },   // 1 - absolute beginner
  { depth: 1, randomness: 0.7, blunderChance: 0.45 },   // 2
  { depth: 1, randomness: 0.55, blunderChance: 0.3 },   // 3
  { depth: 2, randomness: 0.45, blunderChance: 0.22 },  // 4
  { depth: 2, randomness: 0.35, blunderChance: 0.15 },  // 5
  { depth: 2, randomness: 0.28, blunderChance: 0.1 },   // 6
  { depth: 2, randomness: 0.2, blunderChance: 0.06 },   // 7
  { depth: 3, randomness: 0.15, blunderChance: 0.04 },  // 8
  { depth: 3, randomness: 0.1, blunderChance: 0.02 },   // 9
  { depth: 3, randomness: 0.06, blunderChance: 0.01 },  // 10
  { depth: 3, randomness: 0.03, blunderChance: 0.005 }, // 11
  { depth: 4, randomness: 0.02, blunderChance: 0 },     // 12
  { depth: 4, randomness: 0.01, blunderChance: 0 },     // 13
  { depth: 4, randomness: 0, blunderChance: 0 },        // 14
  { depth: 5, randomness: 0, blunderChance: 0 },        // 15 - max
];

export function getBestMove(fen, level = 5) {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;

  const cfg = LEVEL_CONFIG[Math.max(0, Math.min(14, level))];
  const isBlack = chess.turn() === 'b';

  // Blunder: pick a random move sometimes
  if (Math.random() < cfg.blunderChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Random: pick from top-N with some noise
  const scored = [];
  const ordered = orderMoves(moves);
  for (const move of ordered) {
    chess.move(move);
    let score = minimax(chess, cfg.depth - 1, -Infinity, Infinity, !isBlack ? false : true);
    chess.undo();
    // For black, we want to minimize white's score (more negative = better for black)
    scored.push({ move, score: isBlack ? -score : score });
  }

  scored.sort((a, b) => b.score - a.score);

  // Apply randomness, sometimes pick a slightly worse move
  if (cfg.randomness > 0 && Math.random() < cfg.randomness && scored.length > 1) {
    const topN = Math.min(scored.length, Math.ceil(scored.length * 0.4) + 1);
    return scored[Math.floor(Math.random() * topN)].move;
  }

  return scored[0].move;
}

export function getTopMoves(fen, count = 3) {
  const chess = new Chess(fen);
  const moves = orderMoves(chess.moves({ verbose: true }));
  const isBlack = chess.turn() === 'b';
  const scored = [];
  for (const move of moves) {
    chess.move(move);
    let score = minimax(chess, 2, -Infinity, Infinity, !isBlack ? false : true);
    chess.undo();
    scored.push({ move, score: isBlack ? -score : score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.move);
}

export function evaluateMoveQuality(prevFen, move) {
  const before = new Chess(prevFen);
  const isBlack = before.turn() === 'b';
  const topMoves = getTopMoves(prevFen, 3);
  const bestMove = topMoves[0];

  // Score the played move
  const afterPlayed = new Chess(prevFen);
  afterPlayed.move(move);

  if (afterPlayed.isCheckmate()) return { quality: 'brilliant', label: 'Checkmate!' };

  // Compare eval before best move vs played move
  const testBest = new Chess(prevFen);
  testBest.move(bestMove);
  const bestScore = evaluate(testBest) * (isBlack ? -1 : 1);
  const playedScore = evaluate(afterPlayed) * (isBlack ? -1 : 1);

  const loss = bestScore - playedScore;
  const isBest = bestMove.from === move.from && bestMove.to === move.to;

  if (isBest) return { quality: 'best', label: 'Best move' };
  if (loss <= 15) return { quality: 'excellent', label: 'Excellent' };
  if (loss <= 40) return { quality: 'good', label: 'Good' };
  if (loss <= 90) return { quality: 'interesting', label: 'Interesting' };
  if (loss <= 180) return { quality: 'inaccuracy', label: 'Inaccuracy' };
  if (loss <= 350) return { quality: 'mistake', label: 'Mistake' };
  return { quality: 'blunder', label: 'Blunder' };
}

export const LEVEL_ELO = [
  'Beginner', '100 Elo', '300 Elo', '500 Elo', '700 Elo',
  '900 Elo', '1100 Elo', '1300 Elo', '1500 Elo', '1700 Elo',
  '1900 Elo', '2100 Elo', '2300 Elo', '2500 Elo', 'Maximum'
];
