// Objet Gameboard - Gère le plateau de jeu et la logique de victoire
const Gameboard = (() => {
    let board = ['', '', '', '', '', '', '', '', ''];
    
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    return {
        getBoard: () => board,
        getCell: (index) => board[index],
        setCell: (index, marker) => {
            if (board[index] === '') {
                board[index] = marker;
                return true;
            }
            return false;
        },
        reset: () => board = ['', '', '', '', '', '', '', '', ''],
        isFull: () => !board.includes(''),
        checkWinner: () => {
            // Vérifier les combinaisons gagnantes
            for (let [a, b, c] of winningCombinations) {
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    return { marker: board[a], combination: [a, b, c] };
                }
            }
            // Vérifier match nul
            return !board.includes('') ? { marker: 'draw' } : null;
        }
    };
})();

// Factory Player - Gère un joueur individuel et son score
const Player = (marker) => {
    let score = 0;
    
    return {
        getMarker: () => marker,
        getScore: () => score,
        incrementScore: () => score++,
        setScore: (value) => score = value,
        resetScore: () => score = 0
    };
};

// Gestionnaire de scores - Gère la persistance des scores
const ScoreManager = (() => {
    const STORAGE_KEY = 'ticTacToeScores';
    
    return {
        save: (playerX, playerO, draws) => {
            const scores = {
                x: playerX.getScore(),
                o: playerO.getScore(),
                draw: draws
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        },
        load: () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : { x: 0, o: 0, draw: 0 };
        },
        clear: () => localStorage.removeItem(STORAGE_KEY)
    };
})();

// Contrôleur de jeu - Orchestre le flux du jeu
const GameController = (() => {
    const playerX = Player('X');
    const playerO = Player('O');
    let currentPlayer = playerX;
    let gameActive = true;
    let drawCount = 0;
    
    const init = () => {
        const savedScores = ScoreManager.load();
        playerX.setScore(savedScores.x);
        playerO.setScore(savedScores.o);
        drawCount = savedScores.draw;
    };
    
    const switchPlayer = () => {
        currentPlayer = currentPlayer === playerX ? playerO : playerX;
    };
    
    const getPlayerByMarker = (marker) => {
        return marker === 'X' ? playerX : playerO;
    };
    
    return {
        getCurrentPlayer: () => currentPlayer,
        isGameActive: () => gameActive,
        
        playTurn: (index) => {
            if (!gameActive) return false;
            
            if (!Gameboard.setCell(index, currentPlayer.getMarker())) {
                return false;
            }
            
            const result = Gameboard.checkWinner();
            
            if (result) {
                gameActive = false;
                
                if (result.marker === 'draw') {
                    drawCount++;
                    ScoreManager.save(playerX, playerO, drawCount);
                    return { isDraw: true };
                } else {
                    const winner = getPlayerByMarker(result.marker);
                    winner.incrementScore();
                    ScoreManager.save(playerX, playerO, drawCount);
                    return { winner, combination: result.combination };
                }
            }
            
            switchPlayer();
            return { continue: true };
        },
        
        resetGame: () => {
            Gameboard.reset();
            currentPlayer = playerX;
            gameActive = true;
        },
        
        resetAllScores: () => {
            playerX.resetScore();
            playerO.resetScore();
            drawCount = 0;
            ScoreManager.save(playerX, playerO, drawCount);
        },
        
        getScores: () => ({
            x: playerX.getScore(),
            o: playerO.getScore(),
            draw: drawCount
        }),
        
        init
    };
})();


// Contrôleur d'affichage - Gère uniquement l'interface utilisateur
(() => {
    const cells = document.querySelectorAll('.cell');
    const elements = {
        currentPlayer: document.getElementById('current-player'),
        message: document.getElementById('message'),
        scoreX: document.getElementById('score-x'),
        scoreO: document.getElementById('score-o'),
        scoreDraw: document.getElementById('score-draw')
    };
    
    // Mise à jour de l'affichage du plateau
    const renderBoard = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = 'cell';
            if (board[index]) {
                cell.classList.add(board[index].toLowerCase());
            }
        });
    };
    
    // Mise à jour de l'affichage des scores
    const renderScores = () => {
        const scores = GameController.getScores();
        elements.scoreX.textContent = scores.x;
        elements.scoreO.textContent = scores.o;
        elements.scoreDraw.textContent = scores.draw;
    };
    
    // Mise à jour du joueur actuel
    const renderCurrentPlayer = () => {
        elements.currentPlayer.textContent = GameController.getCurrentPlayer().getMarker();
    };
    
    // Affichage d'un message
    const showMessage = (text) => {
        elements.message.textContent = text;
        elements.message.classList.add('show');
    };
    
    // Effacer le message
    const clearMessage = () => {
        elements.message.textContent = '';
        elements.message.classList.remove('show');
    };
    
    // Mettre en évidence les cellules gagnantes
    const highlightWinningCells = (combination) => {
        combination.forEach(index => {
            cells[index].classList.add('winner');
        });
    };
    
    // Gestionnaire de clic sur une cellule
    const handleCellClick = (e) => {
        const index = parseInt(e.target.dataset.index);
        const result = GameController.playTurn(index);
        
        if (!result) return;
        
        renderBoard();
        
        if (result.isDraw) {
            showMessage('Match nul!');
            renderScores();
        } else if (result.winner) {
            showMessage(`Le joueur ${result.winner.getMarker()} a gagné!`);
            highlightWinningCells(result.combination);
            renderScores();
        } else if (result.continue) {
            renderCurrentPlayer();
        }
    };
    
    // Réinitialiser la partie
    const handleReset = () => {
        GameController.resetGame();
        renderBoard();
        renderCurrentPlayer();
        clearMessage();
    };
    
    // Réinitialiser les scores
    const handleResetScores = () => {
        GameController.resetAllScores();
        renderScores();
    };
    
    // Initialisation
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    document.getElementById('reset-btn').addEventListener('click', handleReset);
    document.getElementById('reset-score-btn').addEventListener('click', handleResetScores);
    
    GameController.init();
    renderScores();
    renderCurrentPlayer();
})();
