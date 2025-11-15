/**
 * PlayerProfile.js
 * 
 * THEME 4: VIRTUAL IDENTITY
 * 
 * This module manages player identity, profiles, and persistent data.
 * It demonstrates virtual identity by:
 * - Creating and managing player profiles
 * - Tracking player statistics and achievements
 * - Persisting data across sessions using localStorage
 * - Maintaining player history and leaderboards
 * 
 * THEME 1: SOFTWARE DESIGN (High Cohesion)
 * - Single responsibility: Manages all player-related data
 * - Encapsulates identity and profile logic
 */

class PlayerProfile {
    constructor() {
        this.storageKey = 'puzzleLadder_profiles';
        this.currentPlayerKey = 'puzzleLadder_currentPlayer';
        this.currentPlayer = null;
        this.profiles = this.loadProfiles();
    }

    /**
     * Create a new player profile
     * @param {string} name - Player name
     * @returns {Object} Created player profile
     */
    createProfile(name) {
        const profile = {
            id: this.generatePlayerId(),
            name: name.trim() || 'Guest',
            createdAt: Date.now(),
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalPuzzles: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                highScore: 0,
                averageAccuracy: 0,
                fastestWin: null,
                totalPlayTime: 0
            },
            achievements: [],
            history: []
        };

        this.profiles.push(profile);
        this.saveProfiles();
        this.setCurrentPlayer(profile);

        // Emit event
        eventBus.emit('PROFILE_CREATED', profile);

        return profile;
    }

    /**
     * Set current active player
     * @param {Object} profile - Player profile
     */
    setCurrentPlayer(profile) {
        this.currentPlayer = profile;
        localStorage.setItem(this.currentPlayerKey, JSON.stringify(profile));
        eventBus.emit('PROFILE_LOADED', profile);
    }

    /**
     * Get current player profile
     * @returns {Object|null} Current player or null
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * Update player statistics
     * @param {Object} gameData - Game session data
     */
    updateStats(gameData) {
        if (!this.currentPlayer) return;

        const stats = this.currentPlayer.stats;

        // Update game counts
        stats.gamesPlayed++;
        if (gameData.won) {
            stats.gamesWon++;
        }

        // Update puzzle statistics
        stats.totalPuzzles += gameData.totalPuzzles;
        stats.correctAnswers += gameData.correctAnswers;
        stats.incorrectAnswers += gameData.incorrectAnswers;

        // Update high score
        if (gameData.score > stats.highScore) {
            stats.highScore = gameData.score;
        }

        // Calculate accuracy
        const totalAnswers = stats.correctAnswers + stats.incorrectAnswers;
        stats.averageAccuracy = totalAnswers > 0 
            ? Math.round((stats.correctAnswers / totalAnswers) * 100) 
            : 0;

        // Update fastest win time
        if (gameData.won && gameData.playTime) {
            if (!stats.fastestWin || gameData.playTime < stats.fastestWin) {
                stats.fastestWin = gameData.playTime;
            }
        }

        // Update total play time
        if (gameData.playTime) {
            stats.totalPlayTime += gameData.playTime;
        }

        // Add to history
        this.addGameToHistory(gameData);

        // Check for achievements
        this.checkAchievements(gameData);

        // Save updates
        this.saveProfiles();
        this.setCurrentPlayer(this.currentPlayer);

        // Emit event
        eventBus.emit('STATS_UPDATED', this.currentPlayer.stats);
    }

    /**
     * Add game session to player history
     * @param {Object} gameData - Game session data
     */
    addGameToHistory(gameData) {
        const historyEntry = {
            timestamp: Date.now(),
            won: gameData.won,
            score: gameData.score,
            totalPuzzles: gameData.totalPuzzles,
            correctAnswers: gameData.correctAnswers,
            accuracy: gameData.accuracy,
            playTime: gameData.playTime
        };

        this.currentPlayer.history.unshift(historyEntry);

        // Keep only last 50 games
        if (this.currentPlayer.history.length > 50) {
            this.currentPlayer.history = this.currentPlayer.history.slice(0, 50);
        }
    }

    /**
     * Check and award achievements
     * @param {Object} gameData - Game session data
     */
    checkAchievements(gameData) {
        const achievements = [];

        // First Win
        if (gameData.won && this.currentPlayer.stats.gamesWon === 1) {
            achievements.push({
                id: 'first_win',
                name: 'First Victory',
                description: 'Won your first game',
                icon: '🏆',
                unlockedAt: Date.now()
            });
        }

        // Perfect Game
        if (gameData.won && gameData.accuracy === 100) {
            achievements.push({
                id: 'perfect_game',
                name: 'Perfect Climb',
                description: 'Won with 100% accuracy',
                icon: '⭐',
                unlockedAt: Date.now()
            });
        }

        // Veteran Player
        if (this.currentPlayer.stats.gamesPlayed === 10) {
            achievements.push({
                id: 'veteran',
                name: 'Veteran Climber',
                description: 'Played 10 games',
                icon: '🎖️',
                unlockedAt: Date.now()
            });
        }

        // Puzzle Master
        if (this.currentPlayer.stats.totalPuzzles >= 50) {
            achievements.push({
                id: 'puzzle_master',
                name: 'Puzzle Master',
                description: 'Solved 50 puzzles',
                icon: '🧩',
                unlockedAt: Date.now()
            });
        }

        // Add new achievements
        achievements.forEach(achievement => {
            const exists = this.currentPlayer.achievements.some(a => a.id === achievement.id);
            if (!exists) {
                this.currentPlayer.achievements.push(achievement);
                eventBus.emit('ACHIEVEMENT_UNLOCKED', achievement);
            }
        });
    }

    /**
     * Get leaderboard (top players by high score)
     * @param {number} limit - Number of top players to return
     * @returns {Array} Top players
     */
    getLeaderboard(limit = 10) {
        return this.profiles
            .filter(p => p.stats.gamesPlayed > 0)
            .sort((a, b) => b.stats.highScore - a.stats.highScore)
            .slice(0, limit)
            .map((p, index) => ({
                rank: index + 1,
                name: p.name,
                highScore: p.stats.highScore,
                gamesWon: p.stats.gamesWon,
                accuracy: p.stats.averageAccuracy
            }));
    }

    /**
     * Load profiles from localStorage
     * @returns {Array} Array of player profiles
     */
    loadProfiles() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load profiles:', error);
            return [];
        }
    }

    /**
     * Save profiles to localStorage
     */
    saveProfiles() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.profiles));
        } catch (error) {
            console.error('Failed to save profiles:', error);
        }
    }

    /**
     * Load current player from localStorage
     * @returns {Object|null} Current player or null
     */
    loadCurrentPlayer() {
        try {
            const data = localStorage.getItem(this.currentPlayerKey);
            if (data) {
                this.currentPlayer = JSON.parse(data);
                return this.currentPlayer;
            }
        } catch (error) {
            console.error('Failed to load current player:', error);
        }
        return null;
    }

    /**
     * Generate unique player ID
     * @returns {string} Unique player ID
     */
    generatePlayerId() {
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Reset current player (logout)
     */
    resetCurrentPlayer() {
        this.currentPlayer = null;
        localStorage.removeItem(this.currentPlayerKey);
        eventBus.emit('PROFILE_RESET', null);
    }

    /**
     * Delete a player profile
     * @param {string} playerId - ID of player to delete
     */
    deleteProfile(playerId) {
        this.profiles = this.profiles.filter(p => p.id !== playerId);
        this.saveProfiles();
    }

    /**
     * Export player data (for interoperability)
     * @returns {string} JSON string of player data
     */
    exportPlayerData() {
        if (!this.currentPlayer) return null;
        return JSON.stringify(this.currentPlayer, null, 2);
    }

    /**
     * Get player statistics summary
     * @returns {Object} Statistics summary
     */
    getStatsSummary() {
        if (!this.currentPlayer) return null;

        const stats = this.currentPlayer.stats;
        return {
            playerName: this.currentPlayer.name,
            winRate: stats.gamesPlayed > 0 
                ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                : 0,
            accuracy: stats.averageAccuracy,
            highScore: stats.highScore,
            totalGames: stats.gamesPlayed,
            achievements: this.currentPlayer.achievements.length
        };
    }
}

// Create and export singleton instance
const playerProfile = new PlayerProfile();
