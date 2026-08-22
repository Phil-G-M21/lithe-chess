export const PIECES_INFO = {
  K: {
    name: 'King', symbol: '♔', value: 'Priceless', color: '#d0b0ff',
    description: 'The most important piece. If your King is checkmated, you lose instantly. Moves one square in any direction.',
    movement: 'One square in any direction',
    strengths: ['Powerful fighter in the endgame', 'Can support passed pawns', 'Safe behind a pawn wall'],
    weaknesses: ['Must stay protected', 'Vulnerable to checks', 'Slow'],
    tips: ['Castle early to keep your King safe', 'In the endgame, centralize your King', 'A King on an open file is in danger', "Don't move your King unnecessarily in the opening"],
    funFact: '"Checkmate" comes from Persian "Shah Mat", the King is helpless.',
  },
  Q: {
    name: 'Queen', symbol: '♕', value: '9 points', color: '#f9a8c9',
    description: 'The most powerful piece. Moves any number of squares in any direction. Losing her is usually fatal.',
    movement: 'Any distance, any direction',
    strengths: ['Combines rook and bishop', 'Controls huge space', 'Lethal in attacks'],
    weaknesses: ['Chased by cheaper pieces', 'Dangerous to develop early', 'Hard to escape traps'],
    tips: ["Don't bring her out too early", 'Queen + Rook on the 7th rank is deadly', 'Use her to coordinate, not solo', 'Always check if she can be attacked after moving'],
    funFact: 'The Queen was once the weakest piece. She became strongest in 15th-century Europe.',
  },
  R: {
    name: 'Rook', symbol: '♖', value: '5 points', color: '#7ecfc0',
    description: 'A heavy piece moving horizontally or vertically. Dominant on open files and in the endgame.',
    movement: 'Any distance, straight lines',
    strengths: ['Dominates open files', 'Deadly in endgames', 'Powerful when doubled'],
    weaknesses: ['Needs open lines', 'Slow to develop', 'Clumsy early'],
    tips: ['Place Rooks on open files', 'Double your Rooks for a battery', 'The 7th rank is prime real estate', 'Castle to activate your Rooks'],
    funFact: '"Rook" comes from Persian "Rukh", a war chariot.',
  },
  B: {
    name: 'Bishop', symbol: '♗', value: '3 points', color: '#f0c060',
    description: 'A long-range piece moving diagonally. Each bishop stays on one color for the whole game.',
    movement: 'Any distance, diagonally',
    strengths: ['Long-range control', 'Bishop pair is powerful', 'Great for pinning'],
    weaknesses: ['Stuck on one color', 'Blocked by own pawns', 'Weak in closed positions'],
    tips: ['Keep bishops on open diagonals', 'The bishop pair is an advantage', "Avoid the 'bad bishop' blocked by pawns", 'Bishops beat knights in open positions'],
    funFact: 'In French the bishop is "Fou" (jester); in German "Läufer" (runner).',
  },
  N: {
    name: 'Knight', symbol: '♘', value: '3 points', color: '#7ecfc0',
    description: 'The trickiest piece. Moves in an L-shape and is the ONLY piece that jumps over others.',
    movement: 'L-shape (2+1)',
    strengths: ['Jumps over pieces', 'Great in closed positions', 'Creates forks'],
    weaknesses: ['Short range', 'Slow across the board', 'Weak on edges'],
    tips: ['"A knight on the rim is dim", centralize', 'Knights are fork masters', 'An outpost knight is a long-term asset', 'Knights beat bishops in closed positions'],
    funFact: 'The knight represented cavalry leaping over foot soldiers in ancient India.',
  },
  P: {
    name: 'Pawn', symbol: '♙', value: '1 point', color: '#b8a8d4',
    description: 'The soul of chess. Moves forward, captures diagonally, and promotes on the last rank.',
    movement: 'Forward 1 (2 from start), captures diagonally',
    strengths: ['Can promote to a Queen', 'Passed pawns win endgames', 'Control space', 'Cheap defenders'],
    weaknesses: ['Cannot move backward', 'Doubled pawns are weak', 'Isolated pawns need protection'],
    tips: ['Center pawns are most valuable', 'A passed pawn is a winning weapon', 'Doubled pawns are a weakness', 'Every pawn move is permanent'],
    funFact: 'Tartakower said: "The pawns are the soul of chess."',
  },
};

export const TACTICS = [
  { name: 'Fork', icon: 'ti-arrows-split-2', color: '#d0b0ff', description: 'One piece attacks two enemy pieces at once. The opponent can only save one.', example: 'A knight attacks the king and queen at the same time. The king must move, and you win the queen.' },
  { name: 'Pin', icon: 'ti-pin', color: '#f9a8c9', description: 'A piece cannot move because doing so exposes a more valuable piece behind it.', example: 'A bishop pins a knight against the king. The knight is frozen, it cannot legally move.' },
  { name: 'Skewer', icon: 'ti-arrow-bar-right', color: '#f0c060', description: 'Like a pin, but the valuable piece is in front. It must move, exposing the piece behind.', example: 'A rook checks the king, forcing it to move and exposing the queen behind it.' },
  { name: 'Discovered Attack', icon: 'ti-eye', color: '#7ecfc0', description: 'Moving one piece reveals an attack from another piece behind it.', example: 'You move a knight, uncovering your bishop\'s attack on the enemy queen.' },
  { name: 'Sacrifice', icon: 'ti-diamond', color: '#c07070', description: 'Giving up material to gain a bigger tactical or positional advantage.', example: 'Sacrificing a bishop on h7 to expose the king and launch a mating attack.' },
  { name: 'Back Rank Mate', icon: 'ti-flag', color: '#b8a8d4', description: 'Checkmating a king trapped on its back rank by its own pawns.', example: 'A rook delivers mate on the 1st rank because the king\'s own pawns block its escape.' },
];

export const OPENINGS = [
  {
    name: "Italian Game", moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4", difficulty: "Beginner", color: '#d0b0ff',
    description: "One of the oldest openings. White develops fast, targets f7, and prepares to castle.",
    plan: "Develop pieces fast, castle kingside, attack the center.",
    sequence: [
      { move: 'e4', by: 'w', note: 'White claims the center immediately.' },
      { move: 'e5', by: 'b', note: 'Black mirrors, fighting for the center.' },
      { move: 'Nf3', by: 'w', note: 'Develops a knight AND attacks the e5 pawn.' },
      { move: 'Nc6', by: 'b', note: 'Defends the pawn and develops.' },
      { move: 'Bc4', by: 'w', note: 'The bishop eyes the weak f7 square, the Italian setup.' },
    ],
  },
  {
    name: "London System", moves: "1.d4 d5 2.Nf3 Nf6 3.Bf4", difficulty: "Beginner", color: '#7ecfc0',
    description: "Solid and reliable. Easy to learn, hard to attack. Even Magnus Carlsen plays it.",
    plan: "Build a solid structure, develop everything, outplay in the middlegame.",
    sequence: [
      { move: 'd4', by: 'w', note: 'A different center approach.' },
      { move: 'd5', by: 'b', note: 'Black stakes a claim.' },
      { move: 'Nf3', by: 'w', note: 'Natural development.' },
      { move: 'Nf6', by: 'b', note: 'Black develops too.' },
      { move: 'Bf4', by: 'w', note: 'The London bishop, active before playing e3.' },
    ],
  },
  {
    name: "Queen's Gambit", moves: "1.d4 d5 2.c4", difficulty: "Intermediate", color: '#f9a8c9',
    description: "White offers a pawn to gain center control. Not a true gambit, the pawn can be won back.",
    plan: "Control the center, develop powerfully, use the c-file.",
    sequence: [
      { move: 'd4', by: 'w', note: 'Queen-pawn opening.' },
      { move: 'd5', by: 'b', note: 'Black holds the center.' },
      { move: 'c4', by: 'w', note: 'The gambit, offering the c-pawn to deflect Black\'s d-pawn.' },
    ],
  },
  {
    name: "Ruy López", moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5", difficulty: "Intermediate", color: '#f0c060',
    description: "One of the most studied openings ever. White pressures the knight defending e5.",
    plan: "Pressure indirectly, castle, build a kingside attack.",
    sequence: [
      { move: 'e4', by: 'w', note: 'King-pawn opening.' },
      { move: 'e5', by: 'b', note: 'Symmetric response.' },
      { move: 'Nf3', by: 'w', note: 'Attacks e5.' },
      { move: 'Nc6', by: 'b', note: 'Defends.' },
      { move: 'Bb5', by: 'w', note: 'The Spanish bishop pins pressure on the c6 knight.' },
    ],
  },
  {
    name: "Sicilian Defense", moves: "1.e4 c5", difficulty: "Advanced", color: '#c07070',
    description: "The most popular answer to 1.e4. Black fights for the center from the side. Aggressive.",
    plan: "Create imbalance, counterattack on the queenside.",
    sequence: [
      { move: 'e4', by: 'w', note: 'White opens.' },
      { move: 'c5', by: 'b', note: 'The Sicilian. Black fights asymmetrically for the center.' },
    ],
  },
];

export const LESSONS = [
  { id: 'l1', title: 'Piece Movement', icon: 'ti-chess-knight', level: 1, desc: 'How every piece moves and captures.', unlocked: true },
  { id: 'l2', title: 'Opening Principles', icon: 'ti-flag', level: 1, desc: 'Control the center, develop, castle.', unlocked: true },
  { id: 'l3', title: 'Center Control', icon: 'ti-target', level: 1, desc: 'Why the four central squares matter most.', unlocked: true },
  { id: 'l4', title: 'Development', icon: 'ti-arrows-up', level: 2, desc: 'Getting your pieces active quickly.', unlocked: true },
  { id: 'l5', title: 'Castling', icon: 'ti-shield', level: 2, desc: 'King safety and rook activation.', unlocked: true },
  { id: 'l6', title: 'Pawn Structure', icon: 'ti-wall', level: 2, desc: 'Chains, islands, doubled, isolated.', unlocked: false },
  { id: 'l7', title: 'Tactical Motifs', icon: 'ti-bolt', level: 3, desc: 'Forks, pins, skewers, and more.', unlocked: false },
  { id: 'l8', title: 'Sacrifices', icon: 'ti-diamond', level: 4, desc: 'Giving up material for a bigger goal.', unlocked: false },
  { id: 'l9', title: 'Endgames', icon: 'ti-flag-checkered', level: 4, desc: 'King and pawn, rook endgames, mating.', unlocked: false },
  { id: 'l10', title: 'Checkmating Patterns', icon: 'ti-crown', level: 3, desc: 'Back rank, smothered, ladder mates.', unlocked: false },
];

export const LESSON_CONTENT = {
  l1: {
    title: 'Piece Movement',
    sections: [
      { h: 'The Pawn', t: 'Moves forward one square, or two from its starting position. Captures diagonally. Reaches the last rank? It promotes, usually to a queen.' },
      { h: 'The Knight', t: 'Moves in an L-shape: two squares one way, one square perpendicular. The only piece that jumps over others.' },
      { h: 'The Bishop', t: 'Moves any number of squares diagonally. Stays on one color forever.' },
      { h: 'The Rook', t: 'Moves any number of squares horizontally or vertically. Powerful on open files.' },
      { h: 'The Queen', t: 'Combines rook and bishop, moves any direction, any distance. The most powerful piece.' },
      { h: 'The King', t: 'Moves one square in any direction. Must be protected, checkmate ends the game.' },
    ],
  },
  l2: {
    title: 'Opening Principles',
    sections: [
      { h: 'Rule 1: Control the Center', t: 'The four central squares (e4, d4, e5, d5) are the most valuable. Pieces in the center control more of the board.' },
      { h: 'Rule 2: Develop Your Pieces', t: 'Get your knights and bishops off the back rank early. Knights before bishops, usually.' },
      { h: 'Rule 3: Castle Early', t: 'Tuck your king to safety behind pawns and connect your rooks. Aim to castle in the first 10 moves.' },
      { h: 'Rule 4: Don\'t Move the Same Piece Twice', t: 'In the opening, every move should develop a new piece. Wasting tempo lets your opponent get ahead.' },
      { h: 'Rule 5: Don\'t Bring the Queen Out Early', t: 'She\'ll be chased around by cheaper pieces, and you\'ll lose time.' },
    ],
  },
  l3: {
    title: 'Center Control',
    sections: [
      { h: 'Why the Center?', t: 'A knight in the center controls up to 8 squares. On the edge, only 4. Central pieces are simply more powerful.' },
      { h: 'Pawns in the Center', t: 'Pawns on e4 and d4 (or e5 and d5) grab space and restrict your opponent\'s pieces.' },
      { h: 'Classical vs Hypermodern', t: 'Classical: occupy the center with pawns. Hypermodern: let the opponent build a center, then attack it. Both work.' },
    ],
  },
  l4: {
    title: 'Development',
    sections: [
      { h: 'What is Development?', t: 'Getting your pieces from their starting squares to active positions where they control key squares.' },
      { h: 'Knights Before Bishops', t: 'Knights have clearer best squares (f3, c3). Bishops depend on the pawn structure, so develop them a bit later.' },
      { h: 'A Lead in Development', t: 'If you develop faster than your opponent, you can often launch an attack before they\'re ready.' },
    ],
  },
  l5: {
    title: 'Castling',
    sections: [
      { h: 'What Castling Does', t: 'Moves your king two squares toward a rook, and the rook jumps to the king\'s other side. It does two things at once: king safety AND rook activation.' },
      { h: 'Kingside vs Queenside', t: 'Kingside (short) castling is faster and safer. Queenside (long) is more aggressive but leaves the king slightly more exposed.' },
      { h: 'When You Can\'t Castle', t: 'You can\'t castle if the king or rook has moved, if the king is in check, or if the king passes through an attacked square.' },
    ],
  },
};
