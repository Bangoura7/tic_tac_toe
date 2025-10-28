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
const Player = (marker, name = '') => {
    let score = 0;
    let playerName = name || `Joueur ${marker}`;
    
    return {
        getMarker: () => marker,
        getName: () => playerName,
        setName: (newName) => playerName = newName || `Joueur ${marker}`,
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
        getPlayerX: () => playerX,
        getPlayerO: () => playerO,
        isGameActive: () => gameActive,
        
        setPlayerNames: (nameX, nameO) => {
            playerX.setName(nameX);
            playerO.setName(nameO);
        },
        
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
    // Éléments DOM
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.getElementById('game-area');
    const resultModal = document.getElementById('result-modal');
    const cells = document.querySelectorAll('.cell');
    
    const elements = {
        playerXInput: document.getElementById('player-x-name'),
        playerOInput: document.getElementById('player-o-name'),
        startBtn: document.getElementById('start-btn'),
        currentPlayerName: document.getElementById('current-player-name'),
        currentPlayerMarker: document.getElementById('current-player-marker'),
        scoreX: document.getElementById('score-x'),
        scoreO: document.getElementById('score-o'),
        scoreDraw: document.getElementById('score-draw'),
        scoreXLabel: document.getElementById('score-x-label'),
        scoreOLabel: document.getElementById('score-o-label'),
        resetBtn: document.getElementById('reset-btn'),
        resetScoreBtn: document.getElementById('reset-score-btn'),
        backToMenuBtn: document.getElementById('back-to-menu-btn'),
        resultIcon: document.getElementById('result-icon'),
        resultTitle: document.getElementById('result-title'),
        resultMessage: document.getElementById('result-message'),
        statX: document.getElementById('stat-x'),
        statO: document.getElementById('stat-o'),
        statDraw: document.getElementById('stat-draw'),
        statXLabel: document.getElementById('stat-x-label'),
        statOLabel: document.getElementById('stat-o-label'),
        playAgainBtn: document.getElementById('play-again-btn'),
        closeResultBtn: document.getElementById('close-result-btn')
    };
    
    // Afficher l'écran de jeu
    const showGameArea = () => {
        startScreen.style.display = 'none';
        gameArea.style.display = 'block';
    };
    
    // Afficher l'écran de démarrage
    const showStartScreen = () => {
        startScreen.style.display = 'block';
        gameArea.style.display = 'none';
        resultModal.classList.remove('show');
    };
    
    // Afficher la modal de résultat
    const showResultModal = (isDraw, winner) => {
        const scores = GameController.getScores();
        
        if (isDraw) {
            elements.resultIcon.textContent = '🤝';
            elements.resultTitle.textContent = 'Match Nul !';
            elements.resultMessage.textContent = 'Personne ne remporte cette manche.';
        } else {
            elements.resultIcon.textContent = '🎉';
            elements.resultTitle.textContent = 'Félicitations !';
            elements.resultMessage.textContent = `${winner.getName()} remporte la partie !`;
        }
        
        // Mettre à jour les statistiques
        elements.statXLabel.textContent = GameController.getPlayerX().getName();
        elements.statOLabel.textContent = GameController.getPlayerO().getName();
        elements.statX.textContent = scores.x;
        elements.statO.textContent = scores.o;
        elements.statDraw.textContent = scores.draw;
        
        resultModal.classList.add('show');
    };
    
    // Cacher la modal de résultat
    const hideResultModal = () => {
        resultModal.classList.remove('show');
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
        elements.scoreXLabel.textContent = GameController.getPlayerX().getName();
        elements.scoreOLabel.textContent = GameController.getPlayerO().getName();
        elements.scoreX.textContent = scores.x;
        elements.scoreO.textContent = scores.o;
        elements.scoreDraw.textContent = scores.draw;
    };
    
    // Mise à jour du joueur actuel
    const renderCurrentPlayer = () => {
        const currentPlayer = GameController.getCurrentPlayer();
        elements.currentPlayerName.textContent = currentPlayer.getName();
        elements.currentPlayerMarker.textContent = currentPlayer.getMarker();
    };
    
    // Mettre en évidence les cellules gagnantes
    const highlightWinningCells = (combination) => {
        combination.forEach(index => {
            cells[index].classList.add('winner');
        });
    };
    
    // Gestionnaire de démarrage du jeu
    const handleStart = () => {
        const nameX = elements.playerXInput.value.trim();
        const nameO = elements.playerOInput.value.trim();
        
        GameController.setPlayerNames(nameX, nameO);
        showGameArea();
        renderScores();
        renderCurrentPlayer();
    };
    
    // Gestionnaire de clic sur une cellule
    const handleCellClick = (e) => {
        const index = parseInt(e.target.dataset.index);
        const result = GameController.playTurn(index);
        
        if (!result) return;
        
        renderBoard();
        
        if (result.isDraw) {
            highlightWinningCells([]);
            setTimeout(() => showResultModal(true, null), 500);
            renderScores();
        } else if (result.winner) {
            highlightWinningCells(result.combination);
            setTimeout(() => showResultModal(false, result.winner), 800);
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
        hideResultModal();
    };
    
    // Réinitialiser les scores
    const handleResetScores = () => {
        GameController.resetAllScores();
        renderScores();
    };
    
    // Retour au menu principal
    const handleBackToMenu = () => {
        handleReset();
        showStartScreen();
        elements.playerXInput.value = '';
        elements.playerOInput.value = '';
    };
    
    // Rejouer
    const handlePlayAgain = () => {
        handleReset();
    };
    
    // Validation du formulaire avec Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleStart();
        }
    };
    
    // Initialisation des événements
    elements.startBtn.addEventListener('click', handleStart);
    elements.playerXInput.addEventListener('keypress', handleKeyPress);
    elements.playerOInput.addEventListener('keypress', handleKeyPress);
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    elements.resetBtn.addEventListener('click', handleReset);
    elements.resetScoreBtn.addEventListener('click', handleResetScores);
    elements.backToMenuBtn.addEventListener('click', handleBackToMenu);
    elements.playAgainBtn.addEventListener('click', handlePlayAgain);
    elements.closeResultBtn.addEventListener('click', hideResultModal);
    
    // Initialisation
    GameController.init();
})();
