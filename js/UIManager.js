/**
 * UIManager.js
 * 
 * THEME 1: SOFTWARE DESIGN (High Cohesion, Low Coupling)
 * 
 * This module handles all UI updates and DOM manipulation.
 * It demonstrates:
 * - High Cohesion: All UI logic in one place
 * - Low Coupling: Communicates with other modules only through events
 * - Separation of Concerns: UI logic separated from business logic
 */

class UIManager {
    constructor() {
        this.elements = this.cacheElements();
        this.setupEventListeners();
    }

    /**
     * Cache all DOM elements for performance
     * @returns {Object} Object containing all DOM element references
     */
    cacheElements() {
        return {
            // Sections
            profileSection: document.getElementById('profileSection'),
            gameSection: document.getElementById('gameSection'),
            leaderboardSection: document.getElementById('leaderboardSection'),

            // Profile elements
            playerNameInput: document.getElementById('playerNameInput'),
            startGameBtn: document.getElementById('startGameBtn'),

            // Stats bar
            playerName: document.getElementById('playerName'),
            currentPosition: document.getElementById('currentPosition'),
            currentScore: document.getElementById('currentScore'),
            accuracy: document.getElementById('accuracy'),

            // Ladder
            ladderSteps: document.querySelectorAll('.ladder-step'),
            playerAvatar: document.getElementById('playerAvatar'),

            // Puzzle panel
            puzzleCounter: document.getElementById('puzzleCounter'),
            loadingState: document.getElementById('loadingState'),
            puzzleContent: document.getElementById('puzzleContent'),
            errorState: document.getElementById('errorState'),
            puzzleImage: document.getElementById('puzzleImage'),
            answerForm: document.getElementById('answerForm'),
            answerInput: document.getElementById('answerInput'),
            feedbackMessage: document.getElementById('feedbackMessage'),
            retryBtn: document.getElementById('retryBtn'),

            // Victory modal
            victoryModal: document.getElementById('victoryModal'),
            finalPuzzles: document.getElementById('finalPuzzles'),
            finalCorrect: document.getElementById('finalCorrect'),
            finalScore: document.getElementById('finalScore'),
            finalAccuracy: document.getElementById('finalAccuracy'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            newPlayerBtn: document.getElementById('newPlayerBtn'),

            // Leaderboard
            leaderboardList: document.getElementById('leaderboardList')
        };
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Start game button
        this.elements.startGameBtn.addEventListener('click', () => {
            const playerName = this.elements.playerNameInput.value.trim();
            if (playerName) {
                eventBus.emit('GAME_START_REQUESTED', { playerName });
            } else {
                this.showError('Please enter your name');
            }
        });

        // Enter key on name input
        this.elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.elements.startGameBtn.click();
            }
        });

        // Answer form submission
        this.elements.answerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const answer = parseInt(this.elements.answerInput.value);
            if (!isNaN(answer)) {
                eventBus.emit('ANSWER_SUBMITTED', { answer });
            }
        });

        // Retry button
        this.elements.retryBtn.addEventListener('click', () => {
            eventBus.emit('PUZZLE_RETRY_REQUESTED', null);
        });

        // Victory modal buttons
        this.elements.playAgainBtn.addEventListener('click', () => {
            eventBus.emit('PLAY_AGAIN_REQUESTED', null);
        });

        this.elements.newPlayerBtn.addEventListener('click', () => {
            eventBus.emit('NEW_PLAYER_REQUESTED', null);
        });

        // Subscribe to game events
        this.subscribeToEvents();
    }

    /**
     * Subscribe to game events
     */
    subscribeToEvents() {
        eventBus.on('GAME_STARTED', (data) => this.showGameSection(data));
        eventBus.on('PUZZLE_REQUESTED', () => this.showLoadingState());
        eventBus.on('PUZZLE_LOADED', (puzzle) => this.displayPuzzle(puzzle));
        eventBus.on('PUZZLE_FAILED', () => this.showErrorState());
        eventBus.on('ANSWER_CORRECT', (data) => this.showCorrectFeedback(data));
        eventBus.on('ANSWER_INCORRECT', (data) => this.showIncorrectFeedback(data));
        eventBus.on('POSITION_CHANGED', (data) => this.updatePosition(data));
        eventBus.on('STATS_UPDATED', (stats) => this.updateStats(stats));
        eventBus.on('GAME_WON', (data) => this.showVictoryModal(data));
        eventBus.on('LEADERBOARD_UPDATED', (data) => this.updateLeaderboard(data));
    }

    /**
     * Show game section and hide profile section
     * @param {Object} data - Game start data
     */
    showGameSection(data) {
        this.elements.profileSection.classList.add('hidden');
        this.elements.gameSection.classList.remove('hidden');
        this.elements.playerName.textContent = data.playerName;
        this.resetGameUI();
    }

    /**
     * Reset game UI to initial state
     */
    resetGameUI() {
        this.elements.currentPosition.textContent = '0/10';
        this.elements.currentScore.textContent = '0';
        this.elements.accuracy.textContent = '100%';
        this.elements.answerInput.value = '';
        this.elements.feedbackMessage.classList.add('hidden');
        this.updatePosition({ position: 0 });
    }

    /**
     * Show loading state while fetching puzzle
     */
    showLoadingState() {
        this.elements.loadingState.classList.remove('hidden');
        this.elements.puzzleContent.classList.add('hidden');
        this.elements.errorState.classList.add('hidden');
        this.elements.feedbackMessage.classList.add('hidden');
    }

    /**
     * Display puzzle
     * @param {Object} puzzle - Puzzle data
     */
    displayPuzzle(puzzle) {
        this.elements.loadingState.classList.add('hidden');
        this.elements.puzzleContent.classList.remove('hidden');
        this.elements.errorState.classList.add('hidden');
        
        // Update puzzle image
        this.elements.puzzleImage.src = puzzle.imageUrl;
        this.elements.puzzleImage.alt = 'Math Puzzle';
        
        // Clear previous answer and feedback
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
        this.elements.feedbackMessage.classList.add('hidden');
        
        // Update puzzle counter
        const puzzleNumber = puzzle.puzzleNumber || 1;
        this.elements.puzzleCounter.textContent = `Puzzle #${puzzleNumber}`;
    }

    /**
     * Show error state
     */
    showErrorState() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.puzzleContent.classList.add('hidden');
        this.elements.errorState.classList.remove('hidden');
    }

    /**
     * Show correct answer feedback
     * @param {Object} data - Feedback data
     */
    showCorrectFeedback(data) {
        this.elements.feedbackMessage.textContent = '✓ Correct! Climbing up...';
        this.elements.feedbackMessage.className = 'feedback-message correct';
        this.elements.feedbackMessage.classList.remove('hidden');
        
        // Disable input temporarily
        this.elements.answerInput.disabled = true;
        
        // Re-enable after animation
        setTimeout(() => {
            this.elements.answerInput.disabled = false;
        }, 1500);
    }

    /**
     * Show incorrect answer feedback
     * @param {Object} data - Feedback data
     */
    showIncorrectFeedback(data) {
        const message = data.position > 0 
            ? `✗ Incorrect! The answer was ${data.correctAnswer}. Falling down...`
            : `✗ Incorrect! The answer was ${data.correctAnswer}. Try again!`;
        
        this.elements.feedbackMessage.textContent = message;
        this.elements.feedbackMessage.className = 'feedback-message incorrect';
        this.elements.feedbackMessage.classList.remove('hidden');
        
        // Disable input temporarily
        this.elements.answerInput.disabled = true;
        
        // Re-enable after animation
        setTimeout(() => {
            this.elements.answerInput.disabled = false;
            this.elements.answerInput.focus();
        }, 1500);
    }

    /**
     * Update player position on ladder
     * @param {Object} data - Position data
     */
    updatePosition(data) {
        const position = data.position;
        
        // Update position text
        this.elements.currentPosition.textContent = `${position}/10`;
        
        // Update ladder steps
        this.elements.ladderSteps.forEach((step, index) => {
            const stepNumber = parseInt(step.dataset.step);
            if (stepNumber === position) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Animate player avatar
        const avatarBottom = position * 60 + 25; // 60px per step + 25px offset
        this.elements.playerAvatar.style.bottom = `${avatarBottom}px`;
    }

    /**
     * Update statistics display
     * @param {Object} stats - Statistics data
     */
    updateStats(stats) {
        this.elements.currentScore.textContent = stats.score || 0;
        this.elements.accuracy.textContent = `${stats.accuracy || 100}%`;
    }

    /**
     * Show victory modal
     * @param {Object} data - Game completion data
     */
    showVictoryModal(data) {
        this.elements.finalPuzzles.textContent = data.totalPuzzles;
        this.elements.finalCorrect.textContent = data.correctAnswers;
        this.elements.finalScore.textContent = data.score;
        this.elements.finalAccuracy.textContent = `${data.accuracy}%`;
        
        this.elements.victoryModal.classList.remove('hidden');
    }

    /**
     * Hide victory modal
     */
    hideVictoryModal() {
        this.elements.victoryModal.classList.add('hidden');
    }

    /**
     * Update leaderboard display
     * @param {Array} leaderboard - Leaderboard data
     */
    updateLeaderboard(leaderboard) {
        if (!leaderboard || leaderboard.length === 0) {
            this.elements.leaderboardList.innerHTML = '<p class="no-data">No games played yet</p>';
            return;
        }

        const html = leaderboard.map(entry => `
            <div class="leaderboard-item">
                <span class="leaderboard-rank">#${entry.rank}</span>
                <span class="leaderboard-name">${this.escapeHtml(entry.name)}</span>
                <span class="leaderboard-score">${entry.highScore} pts</span>
            </div>
        `).join('');

        this.elements.leaderboardList.innerHTML = html;
    }

    /**
     * Show profile section
     */
    showProfileSection() {
        this.elements.profileSection.classList.remove('hidden');
        this.elements.gameSection.classList.add('hidden');
        this.elements.playerNameInput.value = '';
        this.elements.playerNameInput.focus();
        this.hideVictoryModal();
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        alert(message); // Simple error display (can be enhanced)
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show notification (for achievements, etc.)
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, info, warning)
     */
    showNotification(message, type = 'info') {
        // Simple console notification (can be enhanced with toast notifications)
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Create and export singleton instance
const uiManager = new UIManager();
