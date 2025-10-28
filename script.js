// Classe Gameboard - Gère le plateau de jeu et la logique de victoire
class Gameboard {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
    }
    
    getBoard() {
        return this.board;
    }
    
    getCell(index) {
        return this.board[index];
    }
    
    setCell(index, marker) {
        if (this.board[index] === '') {
            this.board[index] = marker;
            return true;
        }
        return false;
    }
    
    reset() {
        this.board = ['', '', '', '', '', '', '', '', ''];
    }
    
    isFull() {
        return !this.board.includes('');
    }
    
    checkWinner() {
        // Vérifier les combinaisons gagnantes
        for (let [a, b, c] of this.winningCombinations) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return { marker: this.board[a], combination: [a, b, c] };
            }
        }
        // Vérifier match nul
        return !this.board.includes('') ? { marker: 'draw' } : null;
    }
}

// Classe Player - Gère un joueur individuel et son score
class Player {
    constructor(marker, name = '') {
        this.marker = marker;
        this.name = name || `Joueur ${marker}`;
        this.score = 0;
    }
    
    getMarker() {
        return this.marker;
    }
    
    getName() {
        return this.name;
    }
    
    setName(newName) {
        this.name = newName || `Joueur ${this.marker}`;
    }
    
    getScore() {
        return this.score;
    }
    
    incrementScore() {
        this.score++;
    }
    
    setScore(value) {
        this.score = value;
    }
    
    resetScore() {
        this.score = 0;
    }
}

// Classe ScoreManager - Gère la persistance des scores
class ScoreManager {
    constructor() {
        this.STORAGE_KEY = 'ticTacToeScores';
    }
    
    save(playerX, playerO, draws) {
        const scores = {
            x: playerX.getScore(),
            o: playerO.getScore(),
            draw: draws
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
    }
    
    load() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : { x: 0, o: 0, draw: 0 };
    }
    
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

// Classe GameController - Orchestre le flux du jeu
class GameController {
    constructor() {
        this.gameboard = new Gameboard();
        this.playerX = new Player('X');
        this.playerO = new Player('O');
        this.currentPlayer = this.playerX;
        this.gameActive = true;
        this.drawCount = 0;
        this.scoreManager = new ScoreManager();
    }
    
    init() {
        const savedScores = this.scoreManager.load();
        this.playerX.setScore(savedScores.x);
        this.playerO.setScore(savedScores.o);
        this.drawCount = savedScores.draw;
    }
    
    getCurrentPlayer() {
        return this.currentPlayer;
    }
    
    getPlayerX() {
        return this.playerX;
    }
    
    getPlayerO() {
        return this.playerO;
    }
    
    isGameActive() {
        return this.gameActive;
    }
    
    setPlayerNames(nameX, nameO) {
        this.playerX.setName(nameX);
        this.playerO.setName(nameO);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.playerX ? this.playerO : this.playerX;
    }
    
    getPlayerByMarker(marker) {
        return marker === 'X' ? this.playerX : this.playerO;
    }
    
    playTurn(index) {
        if (!this.gameActive) return false;
        
        if (!this.gameboard.setCell(index, this.currentPlayer.getMarker())) {
            return false;
        }
        
        const result = this.gameboard.checkWinner();
        
        if (result) {
            this.gameActive = false;
            
            if (result.marker === 'draw') {
                this.drawCount++;
                this.scoreManager.save(this.playerX, this.playerO, this.drawCount);
                return { isDraw: true };
            } else {
                const winner = this.getPlayerByMarker(result.marker);
                winner.incrementScore();
                this.scoreManager.save(this.playerX, this.playerO, this.drawCount);
                return { winner, combination: result.combination };
            }
        }
        
        this.switchPlayer();
        return { continue: true };
    }
    
    resetGame() {
        this.gameboard.reset();
        this.currentPlayer = this.playerX;
        this.gameActive = true;
    }
    
    resetAllScores() {
        this.playerX.resetScore();
        this.playerO.resetScore();
        this.drawCount = 0;
        this.scoreManager.save(this.playerX, this.playerO, this.drawCount);
    }
    
    getScores() {
        return {
            x: this.playerX.getScore(),
            o: this.playerO.getScore(),
            draw: this.drawCount
        };
    }
    
    getBoard() {
        return this.gameboard.getBoard();
    }
}


// Classe DisplayController - Gère uniquement l'interface utilisateur
class DisplayController {
    constructor(gameController) {
        this.game = gameController;
        this.initElements();
        this.initEventListeners();
        this.game.init();
    }
    
    initElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameArea = document.getElementById('game-area');
        this.resultModal = document.getElementById('result-modal');
        this.cells = document.querySelectorAll('.cell');
        
        this.elements = {
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
    }
    
    initEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.handleStart());
        this.elements.playerXInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.elements.playerOInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.cells.forEach(cell => cell.addEventListener('click', (e) => this.handleCellClick(e)));
        this.elements.resetBtn.addEventListener('click', () => this.handleReset());
        this.elements.resetScoreBtn.addEventListener('click', () => this.handleResetScores());
        this.elements.backToMenuBtn.addEventListener('click', () => this.handleBackToMenu());
        this.elements.playAgainBtn.addEventListener('click', () => this.handlePlayAgain());
        this.elements.closeResultBtn.addEventListener('click', () => this.hideResultModal());
    }
    
    showGameArea() {
        this.startScreen.style.display = 'none';
        this.gameArea.style.display = 'block';
    }
    
    showStartScreen() {
        this.startScreen.style.display = 'block';
        this.gameArea.style.display = 'none';
        this.resultModal.classList.remove('show');
    }
    
    showResultModal(isDraw, winner) {
        const scores = this.game.getScores();
        
        if (isDraw) {
            this.elements.resultIcon.textContent = '🤝';
            this.elements.resultTitle.textContent = 'Match Nul !';
            this.elements.resultMessage.textContent = 'Personne ne remporte cette manche.';
        } else {
            this.elements.resultIcon.textContent = '🎉';
            this.elements.resultTitle.textContent = 'Félicitations !';
            this.elements.resultMessage.textContent = `${winner.getName()} remporte la partie !`;
        }
        
        // Mettre à jour les statistiques
        this.elements.statXLabel.textContent = this.game.getPlayerX().getName();
        this.elements.statOLabel.textContent = this.game.getPlayerO().getName();
        this.elements.statX.textContent = scores.x;
        this.elements.statO.textContent = scores.o;
        this.elements.statDraw.textContent = scores.draw;
        
        this.resultModal.classList.add('show');
    }
    
    hideResultModal() {
        this.resultModal.classList.remove('show');
    }
    
    renderBoard() {
        const board = this.game.getBoard();
        this.cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = 'cell';
            if (board[index]) {
                cell.classList.add(board[index].toLowerCase());
            }
        });
    }
    
    renderScores() {
        const scores = this.game.getScores();
        this.elements.scoreXLabel.textContent = this.game.getPlayerX().getName();
        this.elements.scoreOLabel.textContent = this.game.getPlayerO().getName();
        this.elements.scoreX.textContent = scores.x;
        this.elements.scoreO.textContent = scores.o;
        this.elements.scoreDraw.textContent = scores.draw;
    }
    
    renderCurrentPlayer() {
        const currentPlayer = this.game.getCurrentPlayer();
        this.elements.currentPlayerName.textContent = currentPlayer.getName();
        this.elements.currentPlayerMarker.textContent = currentPlayer.getMarker();
    }
    
    highlightWinningCells(combination) {
        combination.forEach(index => {
            this.cells[index].classList.add('winner');
        });
    }
    
    handleStart() {
        const nameX = this.elements.playerXInput.value.trim();
        const nameO = this.elements.playerOInput.value.trim();
        
        this.game.setPlayerNames(nameX, nameO);
        this.showGameArea();
        this.renderScores();
        this.renderCurrentPlayer();
    }
    
    handleCellClick(e) {
        const index = parseInt(e.target.dataset.index);
        const result = this.game.playTurn(index);
        
        if (!result) return;
        
        this.renderBoard();
        
        if (result.isDraw) {
            this.highlightWinningCells([]);
            setTimeout(() => this.showResultModal(true, null), 500);
            this.renderScores();
        } else if (result.winner) {
            this.highlightWinningCells(result.combination);
            setTimeout(() => this.showResultModal(false, result.winner), 800);
            this.renderScores();
        } else if (result.continue) {
            this.renderCurrentPlayer();
        }
    }
    
    handleReset() {
        this.game.resetGame();
        this.renderBoard();
        this.renderCurrentPlayer();
        this.hideResultModal();
    }
    
    handleResetScores() {
        this.game.resetAllScores();
        this.renderScores();
    }
    
    handleBackToMenu() {
        this.handleReset();
        this.showStartScreen();
        this.elements.playerXInput.value = '';
        this.elements.playerOInput.value = '';
    }
    
    handlePlayAgain() {
        this.handleReset();
    }
    
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.handleStart();
        }
    }
}

// Initialisation de l'application
const game = new GameController();
const display = new DisplayController(game);
