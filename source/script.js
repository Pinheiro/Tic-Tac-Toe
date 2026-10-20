const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill("");
let gameOver = false;
let currentPlayer = "X";
let scores = {
  player: 0,
  computer: 0,
  draw: 0
};

const statusEl = document.getElementById("status");
const cells = [...document.querySelectorAll(".cell")];
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const drawScoreEl = document.getElementById("draw-score");
const newRoundBtn = document.getElementById("new-round");
const resetScoresBtn = document.getElementById("reset-scores");

function updateScoreboard() {
  playerScoreEl.textContent = scores.player;
  computerScoreEl.textContent = scores.computer;
  drawScoreEl.textContent = scores.draw;
}

function availableMoves(b) {
  return b
    .map((value, index) => (value === "" ? index : null))
    .filter((value) => value !== null);
}

function getWinner(b) {
  for (const combo of winningCombos) {
    const [a, bIndex, c] = combo;
    if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
      return { winner: b[a], combo };
    }
  }
  return null;
}

function isBoardFull(b) {
  return b.every((cell) => cell !== "");
}

function renderBoard() {
  cells.forEach((cell) => {
    const index = Number(cell.dataset.index);
    const value = board[index];

    cell.textContent = value;
    cell.classList.remove("x", "o");

    if (value === "X") {
      cell.classList.add("x");
    } else if (value === "O") {
      cell.classList.add("o");
    }

    const isDisabled =
      value !== "" || gameOver || currentPlayer !== "X";

    cell.disabled = isDisabled;
  });
}

function setStatus(message) {
  statusEl.textContent = message;
}

function finishRound(result) {
  gameOver = true;
  renderBoard();

  if (result && result.winner === "X") {
    scores.player += 1;
    setStatus("You win! 🎉");
  } else if (result && result.winner === "O") {
    scores.computer += 1;
    setStatus("Computer wins. Better luck next time!");
  } else {
    scores.draw += 1;
    setStatus("It's a draw!");
  }

  updateScoreboard();
}

function startNewRound() {
  board = Array(9).fill("");
  gameOver = false;
  currentPlayer = "X";
  setStatus("Your turn — you are X");
  renderBoard();
}

function makeComputerMove() {
  if (gameOver || currentPlayer !== "O") return;

  const bestMove = getBestMove(board);
  if (bestMove === null) return;

  board[bestMove] = "O";
  const result = getWinner(board);

  if (result) {
    finishRound(result);
    return;
  }

  if (isBoardFull(board)) {
    finishRound(null);
    return;
  }

  currentPlayer = "X";
  renderBoard();
  setStatus("Your turn — you are X");
}

function minimax(position, depth, isMaximizing) {
  const winner = getWinner(position);

  if (winner && winner.winner === "O") return 10 - depth;
  if (winner && winner.winner === "X") return depth - 10;
  if (isBoardFull(position)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (const move of availableMoves(position)) {
      position[move] = "O";
      const score = minimax(position, depth + 1, false);
      position[move] = "";
      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const move of availableMoves(position)) {
    position[move] = "X";
    const score = minimax(position, depth + 1, true);
    position[move] = "";
    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

function getBestMove(position) {
  let bestScore = -Infinity;
  let bestMove = null;

  const moves = availableMoves(position);

  for (const move of moves) {
    position[move] = "O";
    const score = minimax(position, 0, false);
    position[move] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (gameOver || currentPlayer !== "X") return;

    const index = Number(cell.dataset.index);

    if (board[index] !== "") return;

    board[index] = "X";

    const result = getWinner(board);

    if (result) {
      finishRound(result);
      return;
    }

    if (isBoardFull(board)) {
      finishRound(null);
      return;
    }

    currentPlayer = "O";
    renderBoard();
    setStatus("Computer is thinking...");

    window.setTimeout(() => {
      makeComputerMove();
    }, 500);
  });
});

newRoundBtn.addEventListener("click", startNewRound);
resetScoresBtn.addEventListener("click", () => {
  scores = { player: 0, computer: 0, draw: 0 };
  updateScoreboard();
  startNewRound();
});

updateScoreboard();
renderBoard();
