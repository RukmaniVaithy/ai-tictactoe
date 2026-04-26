const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('game-status');
const resetBtn = document.getElementById('reset-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBtn = document.getElementById('modal-btn');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreTiesElement = document.getElementById('score-ties');

const btnPva = document.getElementById('btn-pva');
const btnPvp = document.getElementById('btn-pvp');
const lobbyPanel = document.getElementById('lobby-panel');
const lobbyStatus = document.getElementById('lobby-status');
const shareBox = document.getElementById('share-box');
const inviteLinkInput = document.getElementById('invite-link');
const copyBtn = document.getElementById('copy-btn');
const gameArea = document.getElementById('game-area');
const labelX = document.getElementById('label-x');
const labelO = document.getElementById('label-o');

let board = ['', '', '', '', '', '', '', '', ''];
const PLAYER_X = 'X';
const PLAYER_O = 'O'; 
let currentPlayer = PLAYER_X;
let gameActive = true;
let scores = { x: 0, o: 0, ties: 0 };
let gameMode = 'pva'; // 'pva' or 'pvp'

// WebRTC Multiplayer Variables
let peer = null;
let connection = null;
let myRole = PLAYER_X; // Host is X, Joiner is O
let isMyTurn = true; 

const WINNING_CONDITIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]            
];

function initGame() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    resetBtn.addEventListener('click', handleResetClick);
    modalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        handleResetClick();
    });
    
    btnPva.addEventListener('click', () => setGameMode('pva'));
    btnPvp.addEventListener('click', () => setGameMode('pvp'));
    copyBtn.addEventListener('click', copyInviteLink);

    // Check URL parameters for gameId
    const urlParams = new URLSearchParams(window.location.search);
    const joinId = urlParams.get('gameId');

    if (joinId) {
        setGameMode('pvp', joinId);
    } else {
        updateTurnStatus();
    }
}

function setGameMode(mode, joinId = null) {
    if (gameMode === mode && !joinId) return;
    
    gameMode = mode;
    resetGameLogic(true); 
    
    // Update UI Toggles
    if(mode === 'pva') {
        btnPva.classList.add('active');
        btnPvp.classList.remove('active');
        lobbyPanel.classList.add('hidden');
        gameArea.classList.remove('disabled');
        labelX.textContent = "You (X)";
        labelO.textContent = "AI (O)";
        myRole = PLAYER_X; // So the player is always X
        isMyTurn = true;
        closePeerConnection(); // Stop multiplayer if switching back
        // remove URL params seamlessly
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        btnPvp.classList.add('active');
        btnPva.classList.remove('active');
        lobbyPanel.classList.remove('hidden');
        gameArea.classList.add('disabled'); // Disable game area until connected
        
        if (joinId) {
            labelX.textContent = "Opponent (X)";
            labelO.textContent = "You (O)";
            myRole = PLAYER_O;
            isMyTurn = false;
            joinRemoteGame(joinId);
        } else {
            labelX.textContent = "You (X)";
            labelO.textContent = "Opponent (O)";
            myRole = PLAYER_X;
            isMyTurn = true;
            hostRemoteGame();
        }
    }
    updateTurnStatus();
}

/* ==================================
 * WebRTC MULTIPLAYER LOGIC
 * ================================== */

function closePeerConnection() {
    if (connection) connection.close();
    if (peer) peer.destroy();
    peer = null;
    connection = null;
}

function hostRemoteGame() {
    closePeerConnection();
    lobbyStatus.textContent = "Creating game room...";
    shareBox.classList.add('hidden');
    
    peer = new Peer(); 
    
    peer.on('open', (id) => {
        lobbyStatus.textContent = "Waiting for an opponent to join...";
        shareBox.classList.remove('hidden');
        const url = new URL(window.location.href);
        url.searchParams.set('gameId', id);
        inviteLinkInput.value = url.toString();
    });

    peer.on('connection', (conn) => {
        connection = conn;
        setupConnectionEventHandlers();
        lobbyStatus.textContent = "Opponent joined! Game is starting.";
        shareBox.classList.add('hidden');
        setTimeout(() => {
            lobbyPanel.classList.add('hidden');
            gameArea.classList.remove('disabled');
        }, 1500);
    });

    peer.on('error', (err) => {
        console.error(err);
        lobbyStatus.textContent = "Network error. Try switching to PvA and back.";
    });
}

function joinRemoteGame(hostId) {
    closePeerConnection();
    lobbyStatus.textContent = "Connecting to Host...";
    shareBox.classList.add('hidden');

    peer = new Peer();
    
    peer.on('open', () => {
        connection = peer.connect(hostId, { reliable: true });
        
        connection.on('open', () => {
             setupConnectionEventHandlers();
             lobbyStatus.textContent = "Connected to Host!";
             setTimeout(() => {
                 lobbyPanel.classList.add('hidden');
                 gameArea.classList.remove('disabled');
             }, 1000);
        });
    });

    peer.on('error', (err) => {
        console.error(err);
        lobbyStatus.textContent = "Failed to connect. The host might have left.";
    });
}

function setupConnectionEventHandlers() {
    connection.on('data', (data) => {
        // Handle incoming data payload
        if (data.type === 'move') {
            receiveRemoteMove(data.index);
        } else if (data.type === 'reset') {
            resetGameLogic(data.resetScores);
        }
    });
    
    connection.on('close', () => {
        lobbyPanel.classList.remove('hidden');
        gameArea.classList.add('disabled');
        lobbyStatus.textContent = "Opponent disconnected!";
        shareBox.classList.add('hidden');
    });
}

function copyInviteLink() {
    inviteLinkInput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy Link'; }, 2000);
}

/* ==================================
 * CORE GAME LOGIC
 * ================================== */

function cellClicked() {
    const cellIndex = this.getAttribute('data-index');

    if (board[cellIndex] !== '' || !gameActive) return;

    if (gameMode === 'pvp') {
        if (!isMyTurn) return; // Prevent playing out of turn 
        executeMove(cellIndex);
        connection.send({ type: 'move', index: cellIndex });
    } else {
        if (currentPlayer === PLAYER_O) return; // Wait for AI
        executeMove(cellIndex);
        if (gameActive) {
            updateTurnStatus();
            setTimeout(aiMove, 500);
        }
    }
}

function receiveRemoteMove(cellIndex) {
    executeMove(cellIndex);
}

function executeMove(cellIndex) {
    const cell = cells[cellIndex];
    board[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase(), 'occupied');

    checkWinOrDraw();

    if (gameActive) {
        currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
        if (gameMode === 'pvp') {
             isMyTurn = (currentPlayer === myRole);
        }
        updateTurnStatus();
    }
}

function updateTurnStatus() {
    if (!gameActive) return;

    if (gameMode === 'pva') {
        if (currentPlayer === PLAYER_X) {
            statusText.textContent = "Your turn (X)";
        } else {
            statusText.textContent = "AI is thinking...";
        }
    } else {
        if (isMyTurn) {
            statusText.textContent = "Your turn!";
        } else {
            statusText.textContent = "Waiting for Opponent...";
        }
    }
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
        
        let msg = "";
        if (gameMode === 'pva') {
            msg = currentPlayer === PLAYER_X ? "You Win!" : "AI Wins!";
        } else {
            msg = currentPlayer === myRole ? "You Win!" : "Opponent Wins!";
        }
        
        showModal(msg);
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
    
    if (message.includes("You Win")) {
        modalTitle.style.background = "-webkit-linear-gradient(45deg, var(--x-color), #fff)";
    } else if (message.includes("Opponent Wins") || message.includes("AI Wins")) {
        modalTitle.style.background = "-webkit-linear-gradient(45deg, var(--o-color), #fff)";
    } else {
        modalTitle.style.background = "-webkit-linear-gradient(45deg, #aaa, #fff)";
    }
    modalTitle.style.webkitBackgroundClip = "text";
    modalTitle.style.webkitTextFillColor = "transparent";

    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 800);
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

function handleResetClick() {
    resetGameLogic(false);
    if (gameMode === 'pvp' && connection) {
        connection.send({ type: 'reset', resetScores: false });
    }
}

function resetGameLogic(hardResetScore = false) {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = PLAYER_X;
    gameActive = true;
    
    if (gameMode === 'pva') isMyTurn = true;
    else isMyTurn = (myRole === PLAYER_X);

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'occupied', 'win-highlight');
    });
    
    if (hardResetScore) {
        scores = { x: 0, o: 0, ties: 0 };
        scoreXElement.textContent = 0;
        scoreOElement.textContent = 0;
        scoreTiesElement.textContent = 0;
    }
    
    updateTurnStatus();
}

/* ==================================
 * PvA AI LOGIC (Minimax)
 * ================================== */
function aiMove() {
    if (!gameActive || gameMode !== 'pva') return;

    let bestScore = -Infinity;
    let move;
    
    let emptySpots = board.filter(s => s === '').length;
    if (emptySpots === 9) {
        move = [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)]; 
    } else if (emptySpots === 8 && board[4] === '') {
        move = 4; 
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

    executeMove(move);
}

const scoreMap = { 'O': 10, 'X': -10, 'tie': 0 };

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
