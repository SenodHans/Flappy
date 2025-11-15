/**
 * main.js
 * 
 * Application entry point
 * Initializes all modules and starts the application
 * 
 * This file demonstrates the modular architecture where:
 * - Each module is independent and has a single responsibility
 * - Modules communicate through the EventBus (event-driven)
 * - Low coupling between modules
 * - Easy to test and maintain
 */

// Application initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Puzzle Ladder Climb - Initializing...');

    // Log module initialization
    console.log('✓ EventBus initialized');
    console.log('✓ APIService initialized');
    console.log('✓ PlayerProfile initialized');
    console.log('✓ UIManager initialized');
    console.log('✓ GameController initialized');

    // Check if there's a current player session
    const currentPlayer = playerProfile.loadCurrentPlayer();
    if (currentPlayer) {
        console.log(`Welcome back, ${currentPlayer.name}!`);
        // Could auto-show game section or ask if they want to continue
    }

    // Update leaderboard on load
    const leaderboard = playerProfile.getLeaderboard(10);
    eventBus.emit('LEADERBOARD_UPDATED', leaderboard);

    // Setup achievement notifications
    eventBus.on('ACHIEVEMENT_UNLOCKED', (achievement) => {
        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
        showAchievementNotification(achievement);
    });

    // Log game events for debugging (can be removed in production)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setupDebugLogging();
    }

    console.log('🎮 Application ready!');
});

/**
 * Show achievement notification
 * @param {Object} achievement - Achievement data
 */
function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <span class="achievement-icon">${achievement.icon}</span>
            <div class="achievement-text">
                <strong>${achievement.name}</strong>
                <p>${achievement.description}</p>
            </div>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        max-width: 300px;
    `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

/**
 * Setup debug logging for development
 */
function setupDebugLogging() {
    const debugEvents = [
        'GAME_STARTED',
        'PUZZLE_REQUESTED',
        'PUZZLE_LOADED',
        'PUZZLE_FAILED',
        'ANSWER_SUBMITTED',
        'ANSWER_CORRECT',
        'ANSWER_INCORRECT',
        'POSITION_CHANGED',
        'GAME_WON',
        'STATS_UPDATED'
    ];

    debugEvents.forEach(eventName => {
        eventBus.on(eventName, (data) => {
            console.log(`[EVENT] ${eventName}`, data);
        });
    });
}

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Could emit error event for UI to display
});

/**
 * Handle online/offline status
 */
window.addEventListener('online', () => {
    console.log('✓ Connection restored');
    eventBus.emit('CONNECTION_RESTORED', null);
});

window.addEventListener('offline', () => {
    console.log('✗ Connection lost');
    eventBus.emit('CONNECTION_LOST', null);
    alert('Internet connection lost. Please check your connection.');
});

// Add CSS animations for achievement notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .achievement-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .achievement-icon {
        font-size: 2rem;
    }

    .achievement-text strong {
        display: block;
        font-size: 1.1rem;
        margin-bottom: 5px;
    }

    .achievement-text p {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.9;
    }
`;
document.head.appendChild(style);

// Export for debugging in console
window.gameDebug = {
    eventBus,
    apiService,
    playerProfile,
    gameController,
    getState: () => gameController.getGameState(),
    getPlayer: () => playerProfile.getCurrentPlayer(),
    getLeaderboard: () => playerProfile.getLeaderboard(),
    exportData: () => playerProfile.exportPlayerData()
};

console.log('💡 Debug tools available: window.gameDebug');
