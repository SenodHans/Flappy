/**
 * GameController.js
 * 
 * THEME 1: SOFTWARE DESIGN (Low Coupling, High Cohesion)
 * 
 * This is the main game controller that orchestrates the game flow.
 * It demonstrates:
 * - Low Coupling: Communicates with other modules only through the EventBus
 * - High Cohesion: Contains all game logic and state management
 * - Single Responsibility: Manages game state and coordinates game flow
 * 
 * THEME 2: EVENT-DRIVEN PROGRAMMING
 * - Responds to events from UI, API, and other modules
 * - Emits events to notify other modules of state changes
 */

class GameController {
    constructor() {
        this.gameState = {
            isPlaying: false,
            currentPosition: 0,
            maxPosition: 10,
            score: 0,
            puzzleCount: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentPuzzle: null,
            startTime: null
        };

        this.scoreConfig = {
            correctAnswer: 10,
            positionBonus: 5,
            accuracyBonus: 2
        };

        this.setupEventListeners();
    }

    /**
     * Setup event listeners for game events
     */
    setupEventListeners() {
        // Game flow events
        eventBus.on('GAME_START_REQUESTED', (data) => this.startGame(data));
        eventBus.on('ANSWER_SUBMITTED', (data) => this.handleAnswer(data));
        eventBus.on('PUZZLE_LOADED', (puzzle) => this.onPuzzleLoaded(puzzle));
        eventBus.on('PUZZLE_FAILED', () => this.onPuzzleFailed());
        eventBus.on('PUZZLE_RETRY_REQUESTED', () => this.requestPuzzle());
        eventBus.on('PLAY_AGAIN_REQUESTED', () => this.restartGame());
        eventBus.on('NEW_PLAYER_REQUESTED', () => this.newPlayer());
    }

    /**
     * Start a new game
     * @param {Object} data - Game start data with player name
     */
    startGame(data) {
        // Create or load player profile
        const profile = playerProfile.createProfile(data.playerName);

        // Reset game state
        this.resetGameState();

        // Emit game started event
        eventBus.emit('GAME_STARTED', {
            playerName: profile.name,
            timestamp: Date.now()
        });

        // Request first puzzle
        this.requestPuzzle();

        // Update leaderboard
        this.updateLeaderboard();
    }

    /**
     * Reset game state to initial values
     */
    resetGameState() {
        this.gameState = {
            isPlaying: true,
            currentPosition: 0,
            maxPosition: 10,
            score: 0,
            puzzleCount: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentPuzzle: null,
            startTime: Date.now()
        };

        // Emit initial stats
        this.emitStatsUpdate();
    }

    /**
     * Request a new puzzle from API
     */
    async requestPuzzle() {
        if (!this.gameState.isPlaying) return;

        try {
            // APIService will emit PUZZLE_REQUESTED event
            await apiService.fetchPuzzle();
        } catch (error) {
            console.error('Failed to request puzzle:', error);
        }
    }

    /**
     * Handle puzzle loaded event
     * @param {Object} puzzle - Loaded puzzle data
     */
    onPuzzleLoaded(puzzle) {
        this.gameState.currentPuzzle = puzzle;
        this.gameState.puzzleCount++;

        // Add puzzle number to puzzle data
        puzzle.puzzleNumber = this.gameState.puzzleCount;

        // Emit puzzle loaded event with additional data
        eventBus.emit('PUZZLE_DISPLAYED', puzzle);
    }

    /**
     * Handle puzzle load failure
     */
    onPuzzleFailed() {
        console.error('Puzzle loading failed');
        // UI will show error state with retry button
    }

    /**
     * Handle player answer submission
     * @param {Object} data - Answer data
     */
    handleAnswer(data) {
        if (!this.gameState.isPlaying || !this.gameState.currentPuzzle) {
            return;
        }

        const { answer } = data;
        const correctAnswer = this.gameState.currentPuzzle.solution;
        const isCorrect = answer === correctAnswer;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(correctAnswer);
        }

        // Update statistics
        this.emitStatsUpdate();

        // Check win condition
        if (this.gameState.currentPosition >= this.gameState.maxPosition) {
            this.handleGameWon();
        } else {
            // Request next puzzle after delay
            setTimeout(() => {
                if (this.gameState.isPlaying) {
                    this.requestPuzzle();
                }
            }, 1500);
        }
    }

    /**
     * Handle correct answer
     */
    handleCorrectAnswer() {
        this.gameState.correctAnswers++;
        
        // Move up one position
        this.gameState.currentPosition = Math.min(
            this.gameState.currentPosition + 1,
            this.gameState.maxPosition
        );

        // Calculate score
        const baseScore = this.scoreConfig.correctAnswer;
        const positionBonus = this.gameState.currentPosition * this.scoreConfig.positionBonus;
        const accuracyBonus = this.calculateAccuracyBonus();
        
        this.gameState.score += baseScore + positionBonus + accuracyBonus;

        // Emit events
        eventBus.emit('ANSWER_CORRECT', {
            position: this.gameState.currentPosition,
            score: this.gameState.score
        });

        eventBus.emit('POSITION_CHANGED', {
            position: this.gameState.currentPosition,
            direction: 'up'
        });
    }

    /**
     * Handle incorrect answer
     * @param {number} correctAnswer - The correct answer
     */
    handleIncorrectAnswer(correctAnswer) {
        this.gameState.incorrectAnswers++;

        // Move down one position (but not below 0)
        const oldPosition = this.gameState.currentPosition;
        this.gameState.currentPosition = Math.max(
            this.gameState.currentPosition - 1,
            0
        );

        // Emit events
        eventBus.emit('ANSWER_INCORRECT', {
            correctAnswer: correctAnswer,
            position: this.gameState.currentPosition,
            fellDown: oldPosition > this.gameState.currentPosition
        });

        if (oldPosition > this.gameState.currentPosition) {
            eventBus.emit('POSITION_CHANGED', {
                position: this.gameState.currentPosition,
                direction: 'down'
            });
        }
    }

    /**
     * Calculate accuracy bonus
     * @returns {number} Bonus points based on accuracy
     */
    calculateAccuracyBonus() {
        const accuracy = this.calculateAccuracy();
        if (accuracy >= 90) return this.scoreConfig.accuracyBonus * 3;
        if (accuracy >= 75) return this.scoreConfig.accuracyBonus * 2;
        if (accuracy >= 60) return this.scoreConfig.accuracyBonus;
        return 0;
    }

    /**
     * Calculate current accuracy percentage
     * @returns {number} Accuracy percentage
     */
    calculateAccuracy() {
        const totalAnswers = this.gameState.correctAnswers + this.gameState.incorrectAnswers;
        if (totalAnswers === 0) return 100;
        return Math.round((this.gameState.correctAnswers / totalAnswers) * 100);
    }

    /**
     * Emit statistics update event
     */
    emitStatsUpdate() {
        eventBus.emit('STATS_UPDATED', {
            score: this.gameState.score,
            position: this.gameState.currentPosition,
            accuracy: this.calculateAccuracy(),
            correctAnswers: this.gameState.correctAnswers,
            incorrectAnswers: this.gameState.incorrectAnswers,
            totalPuzzles: this.gameState.puzzleCount
        });
    }

    /**
     * Handle game won
     */
    handleGameWon() {
        this.gameState.isPlaying = false;

        const playTime = Date.now() - this.gameState.startTime;
        const accuracy = this.calculateAccuracy();

        const gameData = {
            won: true,
            score: this.gameState.score,
            totalPuzzles: this.gameState.puzzleCount,
            correctAnswers: this.gameState.correctAnswers,
            incorrectAnswers: this.gameState.incorrectAnswers,
            accuracy: accuracy,
            playTime: playTime
        };

        // Update player profile
        playerProfile.updateStats(gameData);

        // Emit game won event
        eventBus.emit('GAME_WON', gameData);

        // Update leaderboard
        this.updateLeaderboard();
    }

    /**
     * Restart game with same player
     */
    restartGame() {
        const currentPlayer = playerProfile.getCurrentPlayer();
        if (currentPlayer) {
            this.startGame({ playerName: currentPlayer.name });
        }
    }

    /**
     * Start new game with new player
     */
    newPlayer() {
        playerProfile.resetCurrentPlayer();
        eventBus.emit('NEW_PLAYER_STARTED', null);
        
        // Show profile section through UI
        uiManager.showProfileSection();
        
        // Update leaderboard
        this.updateLeaderboard();
    }

    /**
     * Update leaderboard
     */
    updateLeaderboard() {
        const leaderboard = playerProfile.getLeaderboard(10);
        eventBus.emit('LEADERBOARD_UPDATED', leaderboard);
    }

    /**
     * Get current game state (for debugging)
     * @returns {Object} Current game state
     */
    getGameState() {
        return { ...this.gameState };
    }

    /**
     * Pause game (future feature)
     */
    pauseGame() {
        this.gameState.isPlaying = false;
        eventBus.emit('GAME_PAUSED', null);
    }

    /**
     * Resume game (future feature)
     */
    resumeGame() {
        this.gameState.isPlaying = true;
        eventBus.emit('GAME_RESUMED', null);
    }
}

// Create and export singleton instance
const gameController = new GameController();
