// Neural AI Subroutine for Cyber Tic-Tac-Toe

const WINNING_LINES = [
  [0, 1, 2], // Row 1 (A1, A2, A3)
  [3, 4, 5], // Row 2 (B1, B2, B3)
  [6, 7, 8], // Row 3 (C1, C2, C3)
  [0, 3, 6], // Col 1 (A1, B1, C1)
  [1, 4, 7], // Col 2 (A2, B2, C2)
  [2, 5, 8], // Col 3 (A3, B3, C3)
  [0, 4, 8], // Diagonal 1
  [2, 4, 6], // Diagonal 2
];

export const SECTOR_NAMES = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];

export function checkWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (board.every((cell) => cell !== null && cell !== '')) {
    return { winner: 'DRAW', line: null };
  }

  return { winner: null, line: null };
}

export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      moves.push(i);
    }
  }
  return moves;
}

// Minimax algorithm for Expert AI
function minimax(board, depth, isMaximizing, alpha, beta) {
  const { winner } = checkWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'DRAW') return 0;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      board[move] = 'O';
      const evalScore = minimax(board, depth + 1, false, alpha, beta);
      board[move] = null;
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      board[move] = 'X';
      const evalScore = minimax(board, depth + 1, true, alpha, beta);
      board[move] = null;
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function findBestMove(board, difficulty = 'hard') {
  const boardCopy = [...board];
  const availableMoves = getAvailableMoves(boardCopy);
  if (availableMoves.length === 0) return null;

  const diff = (difficulty || '').toLowerCase();

  // Easy: Mostly random moves
  if (diff === 'easy') {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Medium: 50% minimax or blocks
  if (diff === 'med' || diff === 'medium') {
    if (Math.random() > 0.6) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // Hard: 85% optimal minimax
  if (diff === 'hard') {
    if (Math.random() > 0.85) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // Expert / Minimax Optimal
  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  for (const move of availableMoves) {
    boardCopy[move] = 'O';
    const score = minimax(boardCopy, 0, false, -Infinity, Infinity);
    boardCopy[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// Recommended stratagem for Player X
export function getRecommendedMove(board) {
  const boardCopy = [...board];
  const availableMoves = getAvailableMoves(boardCopy);
  if (availableMoves.length === 0) return null;

  // Center preference if open
  if (!boardCopy[4]) return 4;

  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  for (const move of availableMoves) {
    boardCopy[move] = 'X';
    // Minimax evaluating for X
    const score = -minimax(boardCopy, 0, true, -Infinity, Infinity);
    boardCopy[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
