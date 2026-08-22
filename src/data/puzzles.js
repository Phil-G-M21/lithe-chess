// Curated puzzles by theme. Each has a FEN, the solution move(s), and teaching notes.
// Solutions are in the format {from, to} or SAN.

export const PUZZLES = [
  // ─── FORKS ───
  {
    id: 'fork1',
    theme: 'Fork',
    difficulty: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: [{ from: 'f3', to: 'e5' }],
    hint: 'Your knight can win a pawn and threaten more.',
    explanation: 'Nxe5 captures the pawn. If Nxe5, then the bishop and center are yours to exploit. Knights love creating multiple threats at once.',
    toMove: 'white',
  },
  {
    id: 'fork2',
    theme: 'Fork',
    difficulty: 2,
    fen: 'r3k2r/ppp2ppp/2n5/2bqp3/8/2N2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1',
    solution: [{ from: 'c3', to: 'd5' }],
    hint: 'A knight jump can attack two pieces at once.',
    explanation: 'Nd5 forks the queen and threatens a fork on c7 hitting king and rook. The knight in the center is a monster.',
    toMove: 'white',
  },
  // ─── PINS ───
  {
    id: 'pin1',
    theme: 'Pin',
    difficulty: 1,
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 1',
    solution: [{ from: 'f8', to: 'b4' }],
    hint: 'Pin a piece against something more valuable.',
    explanation: 'Bb4 pins, a classic developing move creating pressure. Pins freeze enemy pieces in place.',
    toMove: 'black',
  },
  {
    id: 'pin2',
    theme: 'Pin',
    difficulty: 2,
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq - 0 1',
    solution: [{ from: 'f1', to: 'b5' }],
    hint: 'Your bishop can pin the knight to the king.',
    explanation: 'Bb5 pins the knight against the king. The knight cannot move, giving you time to build pressure.',
    toMove: 'white',
  },
  // ─── SKEWERS ───
  {
    id: 'skewer1',
    theme: 'Skewer',
    difficulty: 2,
    fen: '4k3/8/8/8/8/8/4q3/R3K3 w - - 0 1',
    solution: [{ from: 'a1', to: 'a8' }],
    hint: 'Attack the king so it must move, then win what\'s behind.',
    explanation: 'Ra8+ skewers the king. The king must move, and then Rxe... wait, the queen is exposed. A skewer is a pin in reverse, the valuable piece is in front.',
    toMove: 'white',
  },
  // ─── MATE IN ONE ───
  {
    id: 'mate1',
    theme: 'Checkmate',
    difficulty: 1,
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: [{ from: 'a1', to: 'a8' }],
    hint: 'Deliver checkmate on the back rank.',
    explanation: 'Ra8# is checkmate. The king is trapped by its own pawns, this is a back rank mate, one of the most common patterns in chess.',
    toMove: 'white',
  },
  {
    id: 'mate2',
    theme: 'Checkmate',
    difficulty: 2,
    fen: '6k1/5p1p/6p1/8/8/6P1/5P1P/3R2K1 w - - 0 1',
    solution: [{ from: 'd1', to: 'd8' }],
    hint: 'The back rank is weak. Find the mate.',
    explanation: 'Rd8#, the king has no escape. The g6 and h7 pawns block the king in. Always watch for back rank weaknesses.',
    toMove: 'white',
  },
  {
    id: 'mate3',
    theme: 'Checkmate',
    difficulty: 3,
    fen: 'r5rk/5p1p/5R2/4Q3/8/8/7P/7K w - - 0 1',
    solution: [{ from: 'e5', to: 'g7' }],
    hint: 'A queen sacrifice leads to mate.',
    explanation: 'Qxg7#! The queen delivers mate supported by the rook on f6. Sometimes the most beautiful move is a sacrifice.',
    toMove: 'white',
  },
  // ─── DISCOVERED ATTACK ───
  {
    id: 'disc1',
    theme: 'Discovered Attack',
    difficulty: 3,
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: [{ from: 'b5', to: 'c6' }],
    hint: 'Move a piece to unveil an attack behind it.',
    explanation: 'Bxc6 removes a defender. The idea of discovered attacks is moving one piece to reveal another\'s attack.',
    toMove: 'white',
  },
];

export const PUZZLE_THEMES = ['All', 'Fork', 'Pin', 'Skewer', 'Checkmate', 'Discovered Attack'];

export function getPuzzlesByTheme(theme) {
  if (theme === 'All') return PUZZLES;
  return PUZZLES.filter(p => p.theme === theme);
}
