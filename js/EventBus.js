/**
 * EventBus.js
 * 
 * THEME 2: EVENT-DRIVEN PROGRAMMING
 * 
 * This module implements a centralized event bus for decoupled communication
 * between different modules. Components can emit and listen to events without
 * direct dependencies on each other.
 * 
 * Key Features:
 * - Subscribe to events with callbacks
 * - Emit events with data payload
 * - Unsubscribe from events
 * - Low coupling: Modules don't need to know about each other
 */

class EventBus {
    constructor() {
        // Store event listeners in a Map: eventName -> array of callbacks
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to listen for
     * @param {Function} callback - Function to call when event is emitted
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        
        this.listeners.get(eventName).push(callback);
        
        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback to remove
     */
    off(eventName, callback) {
        if (!this.listeners.has(eventName)) return;
        
        const callbacks = this.listeners.get(eventName);
        const index = callbacks.indexOf(callback);
        
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event with optional data
     * @param {string} eventName - Name of the event to emit
     * @param {*} data - Data to pass to event listeners
     */
    emit(eventName, data) {
        if (!this.listeners.has(eventName)) return;
        
        const callbacks = this.listeners.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }

    /**
     * Remove all listeners for an event or all events
     * @param {string} eventName - Optional event name to clear
     */
    clear(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }
}

// Create and export singleton instance
const eventBus = new EventBus();
