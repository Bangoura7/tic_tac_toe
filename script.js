// Variables du jeu
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = {
    x: 0,
    o: 0,
    draw: 0
};

// Combinaisons gagnantes
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

// Éléments DOM
const cells = document.querySelectorAll('.cell');
const currentPlayerDisplay = document.getElementById('current-player');
const messageDisplay = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');
const resetScoreBtn = document.getElementById('reset-score-btn');
const scoreXDisplay = document.getElementById('score-x');
const scoreODisplay = document.getElementById('score-o');
const scoreDrawDisplay = document.getElementById('score-draw');

// Initialisation
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScore);
    
    loadScores();
    updateScoreDisplay();
}

// Gestion du clic sur une cellule
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    // Vérifier si la cellule est déjà occupée ou si le jeu est terminé
    if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Mettre à jour le tableau et l'affichage
    gameBoard[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    
    // Vérifier le résultat
    checkResult();
}

// Vérifier le résultat du jeu
function checkResult() {
    let roundWon = false;
    let winningCombination = null;
    
    // Vérifier toutes les combinaisons gagnantes
    for (let i = 0; i < winningCombinations.length; i++) {
        const combination = winningCombinations[i];
        const a = gameBoard[combination[0]];
        const b = gameBoard[combination[1]];
        const c = gameBoard[combination[2]];
        
        if (a === '' || b === '' || c === '') {
            continue;
        }
        
        if (a === b && b === c) {
            roundWon = true;
            winningCombination = combination;
            break;
        }
    }
    
    if (roundWon) {
        announceWinner(currentPlayer, winningCombination);
        updateScore(currentPlayer.toLowerCase());
        gameActive = false;
        return;
    }
    
    // Vérifier match nul
    if (!gameBoard.includes('')) {
        announceDraw();
        updateScore('draw');
        gameActive = false;
        return;
    }
    
    // Changer de joueur
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerDisplay.textContent = currentPlayer;
}

// Annoncer le gagnant
function announceWinner(player, combination) {
    messageDisplay.textContent = `Le joueur ${player} a gagné!`;
    messageDisplay.classList.add('show');
    
    // Mettre en évidence les cellules gagnantes
    combination.forEach(index => {
        cells[index].classList.add('winner');
    });
}

// Annoncer match nul
function announceDraw() {
    messageDisplay.textContent = 'Match nul!';
    messageDisplay.classList.add('show');
}

// Réinitialiser le jeu
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    currentPlayerDisplay.textContent = currentPlayer;
    messageDisplay.textContent = '';
    messageDisplay.classList.remove('show');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });
}

// Mettre à jour le score
function updateScore(winner) {
    if (winner === 'x') {
        scores.x++;
    } else if (winner === 'o') {
        scores.o++;
    } else if (winner === 'draw') {
        scores.draw++;
    }
    
    updateScoreDisplay();
    saveScores();
}

// Afficher le score
function updateScoreDisplay() {
    scoreXDisplay.textContent = scores.x;
    scoreODisplay.textContent = scores.o;
    scoreDrawDisplay.textContent = scores.draw;
}

// Réinitialiser le score
function resetScore() {
    scores = {
        x: 0,
        o: 0,
        draw: 0
    };
    updateScoreDisplay();
    saveScores();
}

// Sauvegarder les scores dans localStorage
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

// Charger les scores depuis localStorage
function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
    }
}

// Démarrer le jeu
init();
