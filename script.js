const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('game-status');
const resetBtn = document.getElementById('reset-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBtn = document.getElementById('modal-btn');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreTiesElement = document.getElementById('score-ties');

let board = ['', '', '', '', '', '', '', '', ''];
const PLAYER_X = 'X';
const PLAYER_O = 'O'; // AI
let currentPlayer = PLAYER_X;
let gameActive = true;
let scores = { x: 0, o: 0, ties: 0 };

const WINNING_CONDITIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function initGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', cellClicked);
    });
    resetBtn.addEventListener('click', restartGame);
    modalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        restartGame();
    });
    statusText.textContent = "Your turn (X)";
}

function cellClicked() {
    const cellIndex = this.getAttribute('data-index');

    if (board[cellIndex] !== '' || !gameActive || currentPlayer === PLAYER_O) {
        return;
    }

    updateCell(this, cellIndex);
    checkWinOrDraw();

    if (gameActive) {
        currentPlayer = PLAYER_O;
        statusText.textContent = "AI is thinking...";
        setTimeout(aiMove, 500); // slight delay for a more natural feel
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase(), 'occupied');
}

function checkWinOrDraw() {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < WINNING_CONDITIONS.length; i++) {
        const [a, b, c] = WINNING_CONDITIONS[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        highlightWin(winningCells);
        showModal(currentPlayer === PLAYER_X ? "You Win!" : "AI Wins!");
        updateScore(currentPlayer);
        return;
    }

    if (!board.includes('')) {
        gameActive = false;
        showModal("It's a Draw!");
        updateScore('ties');
        return;
    }
}

function highlightWin(winningCells) {
    winningCells.forEach(index => {
        cells[index].classList.add('win-highlight');
    });
}

function showModal(message) {
    statusText.textContent = message;
    modalTitle.textContent = message;
    
    if(message === "You Win!") {
        modalTitle.style.background = "-webkit-linear-gradient(45deg, var(--x-color), #fff)";
    } else if(message === "AI Wins!") {
        modalTitle.style.background = "-webkit-linear-gradient(45deg, var(--o-color), #fff)";
    } else {
        modalTitle.style.background = "-webkit-linear-gradient(45deg, #aaa, #fff)";
    }
    modalTitle.style.webkitBackgroundClip = "text";
    modalTitle.style.webkitTextFillColor = "transparent";

    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 800); // slightly longer delay so user can see winning line
}

function updateScore(winner) {
    if (winner === PLAYER_X) {
        scores.x++;
        scoreXElement.textContent = scores.x;
    } else if (winner === PLAYER_O) {
        scores.o++;
        scoreOElement.textContent = scores.o;
    } else {
        scores.ties++;
        scoreTiesElement.textContent = scores.ties;
    }
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = PLAYER_X;
    gameActive = true;
    statusText.textContent = "Your turn (X)";

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'occupied', 'win-highlight');
    });
}

// AI LOGIC (Minimax with slight randomness if it's the very first move to be interesting)
function aiMove() {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let move;
    
    // Check if board is completely empty or just one move in, add slight randomness 
    // to prevent AI from always picking the top-left or exact same spot if going first/second
    let emptySpots = board.filter(s => s === '').length;
    if (emptySpots === 9) {
        move = [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)]; // pick random corner or center
    } else if (emptySpots === 8 && board[4] === '') {
        move = 4; // always try to take center if it's free on turn 2
    } else {
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = PLAYER_O;
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
    }

    // Make the best move found
    const cell = document.querySelector(`.cell[data-index='${move}']`);
    updateCell(cell, move);
    checkWinOrDraw();

    if (gameActive) {
        currentPlayer = PLAYER_X;
        statusText.textContent = "Your turn (X)";
    }
}

const scoreMap = {
    'O': 10,
    'X': -10,
    'tie': 0
};

function checkWinnerForMinimax() {
    for (let i = 0; i < WINNING_CONDITIONS.length; i++) {
        const [a, b, c] = WINNING_CONDITIONS[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes('')) return 'tie';
    return null;
}

function minimax(boardState, depth, isMaximizing) {
    let result = checkWinnerForMinimax();
    if (result !== null) {
        // adjust score by depth to prefer winning sooner or losing later
        if (result === 'O') return scoreMap[result] - depth;
        if (result === 'X') return scoreMap[result] + depth;
        return scoreMap[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = PLAYER_O;
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = PLAYER_X;
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

initGame();
