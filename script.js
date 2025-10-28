// Objet Gameboard - Gère le plateau de jeu
const Gameboard = (() => {
    let board = ['', '', '', '', '', '', '', '', ''];
    
    const getBoard = () => board;
    
    const setCell = (index, marker) => {
        if (board[index] === '') {
            board[index] = marker;
            return true;
        }
        return false;
    };
    
    const getCell = (index) => board[index];
    
    const reset = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };
    
    const isFull = () => !board.includes('');
    
    return { getBoard, setCell, getCell, reset, isFull };
})();

// Factory pour créer des joueurs
const Player = (name, marker) => {
    let score = 0;
    
    const getName = () => name;
    const getMarker = () => marker;
    const getScore = () => score;
    const incrementScore = () => score++;
    const resetScore = () => score = 0;
    
    return { getName, getMarker, getScore, incrementScore, resetScore };
};

// Objet GameController - Contrôle le déroulement du jeu
const GameController = (() => {
    const playerX = Player('Joueur X', 'X');
    const playerO = Player('Joueur O', 'O');
    let currentPlayer = playerX;
    let gameActive = true;
    let drawCount = 0;
    
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    
    const getCurrentPlayer = () => currentPlayer;
    const isGameActive = () => gameActive;
    
    const switchPlayer = () => {
        currentPlayer = currentPlayer === playerX ? playerO : playerX;
    };
    
    const checkWinner = () => {
        const board = Gameboard.getBoard();
        
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: currentPlayer, combination };
            }
        }
        
        if (Gameboard.isFull()) {
            return { winner: 'draw', combination: null };
        }
        
        return null;
    };
    
    const playTurn = (index) => {
        if (!gameActive) return false;
        
        if (Gameboard.setCell(index, currentPlayer.getMarker())) {
            const result = checkWinner();
            
            if (result) {
                gameActive = false;
                if (result.winner === 'draw') {
                    drawCount++;
                } else {
                    result.winner.incrementScore();
                }
                return result;
            }
            
            switchPlayer();
            return { continue: true };
        }
        
        return false;
    };
    
    const resetGame = () => {
        Gameboard.reset();
        currentPlayer = playerX;
        gameActive = true;
    };
    
    const resetScores = () => {
        playerX.resetScore();
        playerO.resetScore();
        drawCount = 0;
    };
    
    const getScores = () => ({
        x: playerX.getScore(),
        o: playerO.getScore(),
        draw: drawCount
    });
    
    const loadScores = () => {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            const scores = JSON.parse(savedScores);
            for (let i = 0; i < scores.x; i++) playerX.incrementScore();
            for (let i = 0; i < scores.o; i++) playerO.incrementScore();
            drawCount = scores.draw;
        }
    };
    
    const saveScores = () => {
        localStorage.setItem('ticTacToeScores', JSON.stringify(getScores()));
    };
    
    return {
        getCurrentPlayer,
        isGameActive,
        playTurn,
        resetGame,
        resetScores,
        getScores,
        loadScores,
        saveScores
    };
})();

// Module d'affichage - Gère l'interface utilisateur
const DisplayController = (() => {
    const cells = document.querySelectorAll('.cell');
    const currentPlayerDisplay = document.getElementById('current-player');
    const messageDisplay = document.getElementById('message');
    const resetBtn = document.getElementById('reset-btn');
    const resetScoreBtn = document.getElementById('reset-score-btn');
    const scoreXDisplay = document.getElementById('score-x');
    const scoreODisplay = document.getElementById('score-o');
    const scoreDrawDisplay = document.getElementById('score-draw');
    
    const updateDisplay = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = 'cell';
            if (board[index]) {
                cell.classList.add(board[index].toLowerCase());
            }
        });
    };
    
    const updateCurrentPlayer = () => {
        currentPlayerDisplay.textContent = GameController.getCurrentPlayer().getMarker();
    };
    
    const updateScoreDisplay = () => {
        const scores = GameController.getScores();
        scoreXDisplay.textContent = scores.x;
        scoreODisplay.textContent = scores.o;
        scoreDrawDisplay.textContent = scores.draw;
    };
    
    const showMessage = (text) => {
        messageDisplay.textContent = text;
        messageDisplay.classList.add('show');
    };
    
    const clearMessage = () => {
        messageDisplay.textContent = '';
        messageDisplay.classList.remove('show');
    };
    
    const highlightWinningCells = (combination) => {
        combination.forEach(index => {
            cells[index].classList.add('winner');
        });
    };
    
    const handleCellClick = (event) => {
        const index = parseInt(event.target.getAttribute('data-index'));
        const result = GameController.playTurn(index);
        
        if (result) {
            updateDisplay();
            
            if (result.winner === 'draw') {
                showMessage('Match nul!');
                GameController.saveScores();
                updateScoreDisplay();
            } else if (result.winner) {
                showMessage(`Le joueur ${result.winner.getMarker()} a gagné!`);
                highlightWinningCells(result.combination);
                GameController.saveScores();
                updateScoreDisplay();
            } else if (result.continue) {
                updateCurrentPlayer();
            }
        }
    };
    
    const handleReset = () => {
        GameController.resetGame();
        updateDisplay();
        updateCurrentPlayer();
        clearMessage();
    };
    
    const handleResetScore = () => {
        GameController.resetScores();
        updateScoreDisplay();
        GameController.saveScores();
    };
    
    const init = () => {
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
        
        resetBtn.addEventListener('click', handleReset);
        resetScoreBtn.addEventListener('click', handleResetScore);
        
        GameController.loadScores();
        updateScoreDisplay();
        updateCurrentPlayer();
    };
    
    return { init };
})();

// Démarrer le jeu
DisplayController.init();
