// Objet Gameboard - Gère le plateau de jeu
const Gameboard = (() => {
    let board = ['', '', '', '', '', '', '', '', ''];
    
    return {
        getBoard: () => board,
        setCell: (index, marker) => board[index] === '' ? (board[index] = marker, true) : false,
        reset: () => board = ['', '', '', '', '', '', '', '', ''],
        isFull: () => !board.includes('')
    };
})();

// Objet GameController - Contrôle le déroulement du jeu
const GameController = (() => {
    // Factory Player intégrée
    const createPlayer = (marker) => {
        let score = 0;
        return {
            getMarker: () => marker,
            getScore: () => score,
            incrementScore: () => score++,
            resetScore: () => score = 0
        };
    };
    
    const playerX = createPlayer('X');
    const playerO = createPlayer('O');
    let currentPlayer = playerX;
    let gameActive = true;
    let drawCount = 0;
    
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    const checkWinner = () => {
        const board = Gameboard.getBoard();
        for (let [a, b, c] of winningCombinations) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: currentPlayer, combination: [a, b, c] };
            }
        }
        return Gameboard.isFull() ? { winner: 'draw' } : null;
    };
    
    return {
        getCurrentPlayer: () => currentPlayer,
        playTurn: (index) => {
            if (!gameActive || !Gameboard.setCell(index, currentPlayer.getMarker())) {
                return false;
            }
            
            const result = checkWinner();
            if (result) {
                gameActive = false;
                result.winner === 'draw' ? drawCount++ : result.winner.incrementScore();
                return result;
            }
            
            currentPlayer = currentPlayer === playerX ? playerO : playerX;
            return { continue: true };
        },
        resetGame: () => {
            Gameboard.reset();
            currentPlayer = playerX;
            gameActive = true;
        },
        resetScores: () => {
            playerX.resetScore();
            playerO.resetScore();
            drawCount = 0;
        },
        getScores: () => ({ x: playerX.getScore(), o: playerO.getScore(), draw: drawCount }),
        loadScores: () => {
            const saved = localStorage.getItem('ticTacToeScores');
            if (saved) {
                const { x, o, draw } = JSON.parse(saved);
                for (let i = 0; i < x; i++) playerX.incrementScore();
                for (let i = 0; i < o; i++) playerO.incrementScore();
                drawCount = draw;
            }
        },
        saveScores: () => localStorage.setItem('ticTacToeScores', 
            JSON.stringify({ x: playerX.getScore(), o: playerO.getScore(), draw: drawCount }))
    };
})();


// Module d'affichage - Gère l'interface utilisateur et s'auto-initialise
(() => {
    const cells = document.querySelectorAll('.cell');
    const elements = {
        currentPlayer: document.getElementById('current-player'),
        message: document.getElementById('message'),
        scoreX: document.getElementById('score-x'),
        scoreO: document.getElementById('score-o'),
        scoreDraw: document.getElementById('score-draw')
    };
    
    const updateDisplay = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = 'cell';
            if (board[index]) cell.classList.add(board[index].toLowerCase());
        });
    };
    
    const updateScores = () => {
        const scores = GameController.getScores();
        elements.scoreX.textContent = scores.x;
        elements.scoreO.textContent = scores.o;
        elements.scoreDraw.textContent = scores.draw;
    };
    
    const showMessage = (text, winningCells) => {
        elements.message.textContent = text;
        elements.message.classList.add('show');
        if (winningCells) {
            winningCells.forEach(index => cells[index].classList.add('winner'));
        }
    };
    
    const handleCellClick = (e) => {
        const result = GameController.playTurn(parseInt(e.target.dataset.index));
        if (!result) return;
        
        updateDisplay();
        
        if (result.winner === 'draw') {
            showMessage('Match nul!');
            GameController.saveScores();
            updateScores();
        } else if (result.winner) {
            showMessage(`Le joueur ${result.winner.getMarker()} a gagné!`, result.combination);
            GameController.saveScores();
            updateScores();
        } else {
            elements.currentPlayer.textContent = GameController.getCurrentPlayer().getMarker();
        }
    };
    
    const handleReset = () => {
        GameController.resetGame();
        updateDisplay();
        elements.currentPlayer.textContent = GameController.getCurrentPlayer().getMarker();
        elements.message.textContent = '';
        elements.message.classList.remove('show');
    };
    
    const handleResetScore = () => {
        GameController.resetScores();
        updateScores();
        GameController.saveScores();
    };
    
    // Initialisation automatique
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    document.getElementById('reset-btn').addEventListener('click', handleReset);
    document.getElementById('reset-score-btn').addEventListener('click', handleResetScore);
    
    GameController.loadScores();
    updateScores();
    elements.currentPlayer.textContent = GameController.getCurrentPlayer().getMarker();
})();
