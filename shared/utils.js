// StoryDirector Shared Utilities

const StoryDirectorUtils = {
    
    // ===== DATA MANAGEMENT =====
    
    // Generate unique IDs for components
    generateId(prefix = 'item') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Deep clone objects (for state management)
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Save data to localStorage with error handling
    saveToLocal(key, data) {
        try {
            localStorage.setItem(`storydirector_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    },

    // Load data from localStorage with error handling
    loadFromLocal(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`storydirector_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },

    // Export data as downloadable JSON file
    exportAsJSON(data, filename = 'storydirector-data') {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${filename}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    },

    // ===== DATE & TIME =====
    
    // Get formatted timestamp
    getTimestamp(format = 'full') {
        const now = new Date();
        
        switch (format) {
            case 'time':
                return now.toLocaleTimeString();
            case 'date':
                return now.toLocaleDateString();
            case 'short':
                return now.toLocaleString();
            case 'iso':
                return now.toISOString();
            default:
                return now.toLocaleString();
        }
    },

    // Calculate reading time for text
    calculateReadingTime(text, wordsPerMinute = 250) {
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    },

    // ===== TEXT PROCESSING =====
    
    // Count words in text
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    // Extract keywords from text (simple version)
    extractKeywords(text, maxKeywords = 5) {
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must']);
        
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !commonWords.has(word));
        
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, maxKeywords)
            .map(([word]) => word);
    },

    // Truncate text with ellipsis
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    },

    // ===== UI HELPERS =====
    
    // Debounce function calls (useful for search, auto-save)
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles if not already present
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 6px;
                    color: white;
                    z-index: 10000;
                    animation: slideInToast 0.3s ease-out;
                }
                .toast-info { background: var(--primary); color: #000; }
                .toast-success { background: var(--success); }
                .toast-warning { background: var(--warning); }
                .toast-error { background: var(--error); }
                @keyframes slideInToast {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInToast 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Confirm dialog with custom styling
    confirm(message, onConfirm, onCancel = null) {
        if (window.confirm(message)) {
            onConfirm();
        } else if (onCancel) {
            onCancel();
        }
    },

    // ===== VALIDATION =====
    
    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // ===== COMPONENT COMMUNICATION =====
    
    // Simple event system for component communication
    events: {
        listeners: {},
        
        on(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },
        
        off(event, callback) {
            if (!this.listeners[event]) return;
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        },
        
        emit(event, data = null) {
            if (!this.listeners[event]) return;
            this.listeners[event].forEach(callback => callback(data));
        }
    },

    // ===== VOICE CHEMISTRY HELPERS =====
    
    // Parse V2P EQ formula (e.g., "Co₈ + Dx₆ + El₅")
    parseVoiceFormula(formula) {
        const elements = [];
        const matches = formula.match(/([A-Z][a-z]?)₍?(\d+)₎?/g);
        
        if (matches) {
            matches.forEach(match => {
                const [, symbol, level] = match.match(/([A-Z][a-z]?)₍?(\d+)₎?/);
                elements.push({ symbol, level: parseInt(level) });
            });
        }
        
        return elements;
    },

    // Generate V2P EQ formula from elements array
    generateVoiceFormula(elements) {
        return elements
            .map(el => `${el.symbol}₍${el.level}₎`)
            .join(' + ');
    },

    // Get element name from symbol
    getElementName(symbol) {
        const elementNames = {
            'Co': 'Coordination',
            'Dx': 'Deixis',
            'El': 'Ellipsis',
            'Rg': 'Register',
            'Sb': 'Subordination',
            'Mt': 'Metaphor',
            'Rh': 'Rhythm',
            'An': 'Anaphora',
            'Rp': 'Repetition',
            'Im': 'Implicature',
            'Md': 'Modality',
            'Fr': 'Frequency',
            'Dr': 'Derivation',
            'Pm': 'Polysemy',
            'Ch': 'Cohesion'
        };
        return elementNames[symbol] || symbol;
    },

    // ===== RANDOM HELPERS =====
    
    // Generate random color for snippets, characters, etc.
    getRandomColor() {
        const colors = [
            'var(--primary)', 'var(--secondary)', 'var(--accent)',
            'var(--concept-color)', 'var(--character-color)', 'var(--scene-color)',
            'var(--world-color)', 'var(--dialogue-color)', 'var(--theme-color)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Get random element from array
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // ===== ERROR HANDLING =====
    
    // Log errors consistently
    logError(error, context = '') {
        console.error(`StoryDirector Error ${context}:`, error);
        
        // In production, you might want to send to error tracking service
        // this.sendToErrorTracking(error, context);
    },

    // Try/catch wrapper for async operations
    async safeAsync(asyncFunction, fallback = null) {
        try {
            return await asyncFunction();
        } catch (error) {
            this.logError(error, 'safeAsync');
            return fallback;
        }
    }
};

// Make available globally
window.StoryDirectorUtils = StoryDirectorUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryDirectorUtils;
}