import { Chess } from 'chess.js';

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
const PIECE_NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const pn = t => PIECE_NAMES[t] || t;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const TIPS = {
  opening: [
    "Control the center. Pawns on e4 and d4 dominate.",
    "Develop knights and bishops off the back rank fast.",
    "Castle early, king safety wins games.",
    "Don't move the same piece twice in the opening.",
    "Develop toward the center for maximum control.",
  ],
  P: [
    "Pawns can't go backward. Every push is permanent.",
    "Side-by-side pawns protect each other, a pawn chain.",
    "A pawn reaching the back rank becomes a queen.",
    "Doubled pawns are a weakness. Avoid creating them.",
    "A passed pawn is a long-term winning weapon.",
  ],
  N: [
    "Knights are strongest in the center, up to 8 squares.",
    "'A knight on the rim is dim.' Keep them central.",
    "Knights shine in closed positions.",
    "Knights are the only pieces that jump, use it.",
  ],
  B: [
    "Bishops love open diagonals. Don't block them with pawns.",
    "The bishop pair is powerful in open games.",
    "Each bishop controls one color forever.",
    "Bishops beat knights in open positions.",
  ],
  R: [
    "Rooks need open files. Push them there after pawns clear.",
    "Double your rooks for a devastating battery.",
    "Rooks dominate the endgame.",
    "The 7th rank is prime real estate for rooks.",
  ],
  Q: [
    "Don't develop the queen too early, she gets chased.",
    "Queen + rook on the 7th rank is deadly.",
    "The queen coordinates attacks; she rarely goes solo.",
    "Always check if your queen can be attacked.",
  ],
  K: [
    "Castle early, three pawns make a fortress.",
    "In the endgame, an active king is a winning king.",
    "A king on an open file is in danger.",
    "Never castle into an attack.",
  ],
  capture: [
    "Check the opponent's biggest threat before capturing.",
    "Free pieces should almost always be taken.",
    "A good trade gives up equal or lesser value.",
    "Capturing toward the center is usually best.",
  ],
  check: [
    "In check, you must respond: move, block, or capture.",
    "Not all checks are good. Only check with a purpose.",
    "Perpetual check forces a draw when you're losing.",
  ],
};

const AI_EXPLAIN = {
  P: sq => `The computer pushed a pawn to ${sq}. Pawns control space and can promote.`,
  N: sq => `Knight to ${sq}. The computer is developing toward the center.`,
  B: sq => `Bishop to ${sq}. Watch the diagonal it now controls.`,
  R: sq => `Rook to ${sq}. It's claiming a file.`,
  Q: sq => `Queen to ${sq}. Scan every square she now threatens.`,
  K: sq => `King to ${sq}. Castling or activating in the endgame.`,
};

export function getTutorComment({ move, prevFen, fen, isAI, quality, moveNumber, isCheck, isCheckmate, isCoachMode }) {
  const chess = new Chess(fen);
  const sq = move.to;
  const piece = move.piece?.toUpperCase() || 'P';
  const captured = move.captured;
  const isOpening = moveNumber <= 10;
  const pieceCount = chess.board().flat().filter(Boolean).length;
  const isEndgame = pieceCount <= 12;

  if (isCheckmate) {
    return isAI
      ? { tone: 'blunder', label: 'Checkmate, computer wins', text: `The computer checkmated you. Your king had no escape. Study where the attack came from.`, tip: 'Next game: castle early, keep pawns in front of your king, watch open files.'}
      : { tone: 'brilliant', label: 'Checkmate, you won!', text: `You did it! The king had nowhere to run. That's the whole goal of chess.`, tip: 'Notice how your pieces worked together to seal every escape square.'};
  }

  if (isCheck) {
    return isAI
      ? { tone: 'warn', label: "You're in check!", text: `The computer checked your king. Respond now, move the king, block, or capture the attacker.`, tip: rand(TIPS.check)}
      : { tone: 'good', label: 'Check!', text: `You put the computer's king in check! It must respond immediately.`, tip: rand(TIPS.check)};
  }

  if (isAI) {
    const explain = AI_EXPLAIN[piece]?.(sq) || `The computer moved its ${pn(move.piece)} to ${sq}.`;
    const capMsg = captured ? ` It captured your ${pn(captured)}, material is now unequal.` : '';
    return { tone: 'ai', label: 'Computer played', text: explain + capMsg + ' What is its biggest threat now? Think before you move.', tip: rand(captured ? TIPS.capture : (TIPS[piece] || TIPS.P))};
  }

  // Player move by quality
  let text = '', tip = '';

  if (quality === 'blunder') {
    text = piece === 'Q'
      ? `You moved your queen to ${sq}, but it can now be captured or you left something hanging. Losing the queen is almost always game over.`
      : `That move to ${sq} was a blunder, it lost material, exposed your king, or created a serious weakness. Breathe, and look at what the computer can do now.`;
    tip = 'Before every move ask: "After I move, what can my opponent do?" This one question prevents most blunders.';
  } else if (quality === 'mistake') {
    text = `${cap(pn(move.piece))} to ${sq} gave the computer an advantage. A better option was available.`;
    tip = 'When you see a good move, look for a better one before you play.';
  } else if (quality === 'inaccuracy') {
    text = `${cap(pn(move.piece))} to ${sq}, playable, but there was a slightly stronger move.`;
    tip = isOpening ? rand(TIPS.opening) : 'Small inaccuracies add up. Find the most active square for each piece.';
  } else if (quality === 'good' || quality === 'interesting') {
    const msgs = {
      P: captured ? `You captured on ${sq} with your pawn. Capturing toward the center is usually best.` : isOpening ? (['e4','d4','e5','d5'].includes(sq) ? `Pawn to ${sq}, textbook center control.` : `Pawn to ${sq}. Solid. Keep developing now.`) : `Pawn to ${sq}. Remember, every push is permanent.`,
      N: `Knight to ${sq}. ${isOpening ? 'Good development toward the center.' : 'Check the squares it now controls.'}`,
      B: `Bishop to ${sq}. ${isOpening ? 'Good development.' : 'That diagonal is now active.'}`,
      R: `Rook to ${sq}. ${isOpening ? 'Rooks come out after castling.' : 'Is that file open?'}`,
      Q: `Queen to ${sq}. Active, but make sure she can't be chased.`,
      K: isEndgame ? `King to ${sq}. Good, activate your king in the endgame.` : `King to ${sq}. Make sure it's safe.`,
    };
    text = msgs[piece] || `${cap(pn(move.piece))} to ${sq}.`;
    tip = rand(isOpening ? TIPS.opening : (TIPS[piece] || TIPS.P));
  } else {
    text = quality === 'brilliant'
      ? `Brilliant! ${cap(pn(move.piece))} to ${sq}${captured ? `, taking the ${pn(captured)}` : ''}, a strong, unexpected idea.`
      : quality === 'best'
        ? `Best move! ${cap(pn(move.piece))} to ${sq}, exactly what a strong player would find.`
        : `Excellent! ${cap(pn(move.piece))} to ${sq}${captured ? `, capturing the ${pn(captured)}` : ''}.`;
    tip = rand(TIPS[piece] || TIPS.P);
  }

  if (isCoachMode && (quality === 'blunder' || quality === 'mistake')) {
    return { tone: quality, label: cap(quality), text: `That move had a problem, but before I explain, can you spot it? Look: which of your pieces is now undefended or in danger?`, tip: 'In coach mode, find the mistake yourself first. It trains your eye.', isQuestion: true };
  }

  return { tone: quality || 'info', label: quality ? cap(quality) : 'Move made', text, tip};
}
