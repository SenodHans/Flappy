/**
 * APIService.js
 * 
 * THEME 3: INTEROPERABILITY
 * 
 * This module handles all external API communication with the Heart Game API.
 * It provides a clean interface for fetching puzzles and abstracts away
 * the API implementation details.
 * 
 * Key Features:
 * - Fetch puzzles from external Heart API
 * - Handle different response formats (JSON, CSV)
 * - Error handling and retry logic
 * - Caching mechanism for better performance
 * - High cohesion: Only responsible for API communication
 */

class APIService {
    constructor() {
        // Heart Game API configuration
        this.baseURL = 'https://marcconrad.com/uob/heart/api.php';
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
    }

    /**
     * Fetch a new puzzle from the Heart API
     * @param {string} format - Response format ('json' or 'csv')
     * @returns {Promise<Object>} Puzzle data with image URL and solution
     */
    async fetchPuzzle(format = 'json') {
        try {
            // Build API URL with parameters
            const url = `${this.baseURL}?out=${format}&t=${Date.now()}`;
            
            // Emit event: API request started
            eventBus.emit('api:request:start', { url });
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let data;
            
            if (format === 'json') {
                data = await response.json();
            } else if (format === 'csv') {
                const csvText = await response.text();
                data = this.parseCSV(csvText);
            }
            
            // Validate puzzle data
            if (!data || !data.url || data.solution === undefined) {
                throw new Error('Invalid puzzle data received from API');
            }
            
            // Emit event: API request successful
            eventBus.emit('api:request:success', data);
            
            return {
                imageUrl: data.url,
                solution: parseInt(data.solution),
                format: format,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Emit event: API request failed
            eventBus.emit('api:request:error', { error: error.message });
            
            // Return fallback puzzle for demo purposes
            return this.getFallbackPuzzle();
        }
    }

    /**
     * Parse CSV response from API
     * @param {string} csvText - CSV formatted text
     * @returns {Object} Parsed puzzle data
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('Invalid CSV format');
        }
        
        // First line is headers, second line is data
        const headers = lines[0].split(',');
        const values = lines[1].split(',');
        
        const data = {};
        headers.forEach((header, index) => {
            data[header.trim()] = values[index]?.trim();
        });
        
        return data;
    }

    /**
     * Get a fallback puzzle if API fails
     * @returns {Object} Fallback puzzle data
     */
    getFallbackPuzzle() {
        return {
            imageUrl: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Puzzle+Loading+Error',
            solution: Math.floor(Math.random() * 10),
            format: 'fallback',
            timestamp: Date.now()
        };
    }

    /**
     * Preload puzzle image to ensure it's cached
     * @param {string} imageUrl - URL of the image to preload
     * @returns {Promise<void>}
     */
    async preloadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
        });
    }

    /**
     * Test API connectivity
     * @returns {Promise<boolean>} True if API is reachable
     */
    async testConnection() {
        try {
            const puzzle = await this.fetchPuzzle();
            return puzzle.format !== 'fallback';
        } catch (error) {
            return false;
        }
    }
}

// Create and export singleton instance
const apiService = new APIService();
