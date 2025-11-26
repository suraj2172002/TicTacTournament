export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const calculateWinner = (squares) => {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
};

export const isBoardFull = (squares) => squares.every(Boolean);

const randomMove = (board) => {
  const available = board
    .map((value, index) => (value ? null : index))
    .filter((val) => val !== null);
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
};

const centerPriorityStrategy = (board) => {
  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter((idx) => !board[idx]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return randomMove(board);
};

const checkLineForSymbol = (board, symbol) => {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const values = [board[a], board[b], board[c]];
    if (values.filter(Boolean).length === 2 && values.filter((v) => v === symbol).length === 2) {
      const emptyIndex = line.find((idx) => !board[idx]);
      if (emptyIndex !== undefined) return emptyIndex;
    }
  }
  return null;
};

const tacticalStrategy = (board, aiSymbol, playerSymbol) => {
  const winningMove = checkLineForSymbol(board, aiSymbol);
  if (winningMove !== null) return winningMove;

  const blockingMove = checkLineForSymbol(board, playerSymbol);
  if (blockingMove !== null) return blockingMove;

  return centerPriorityStrategy(board);
};

const minimax = (board, depth, isMax, aiSymbol, playerSymbol, depthLimit) => {
  const { winner } = calculateWinner(board);

  if (winner === aiSymbol) return 10 - depth;
  if (winner === playerSymbol) return depth - 10;
  if (isBoardFull(board) || depth === depthLimit) return 0;

  if (isMax) {
    let bestScore = -Infinity;
    board.forEach((value, index) => {
      if (!value) {
        board[index] = aiSymbol;
        bestScore = Math.max(bestScore, minimax(board, depth + 1, false, aiSymbol, playerSymbol, depthLimit));
        board[index] = null;
      }
    });
    return bestScore;
  }

  let bestScore = Infinity;
  board.forEach((value, index) => {
    if (!value) {
      board[index] = playerSymbol;
      bestScore = Math.min(bestScore, minimax(board, depth + 1, true, aiSymbol, playerSymbol, depthLimit));
      board[index] = null;
    }
  });
  return bestScore;
};

const minimaxStrategy = (board, aiSymbol, playerSymbol, depthLimit = Infinity) => {
  let bestScore = -Infinity;
  let move = null;

  board.forEach((value, index) => {
    if (!value) {
      board[index] = aiSymbol;
      const score = minimax(board, 0, false, aiSymbol, playerSymbol, depthLimit);
      board[index] = null;
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });

  return move ?? randomMove(board);
};

export const LEVELS = [
  { level: 1, label: 'Rookie (Random)', strategy: (board) => randomMove(board) },
  { level: 2, label: 'Challenger (Center First)', strategy: (board) => centerPriorityStrategy(board) },
  { level: 3, label: 'Tactician (Win/Block)', strategy: (board) => tacticalStrategy(board, 'O', 'X') },
  { level: 4, label: 'Master (Depth-Limited AI)', strategy: (board) => minimaxStrategy(board, 'O', 'X', 4) },
  { level: 5, label: 'Legend (Perfect AI)', strategy: (board) => minimaxStrategy(board, 'O', 'X') },
];



