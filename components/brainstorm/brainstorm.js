const BrainstormApp = {
    snippets: [],
    nextId: 1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    currentSnippet: null,

    init() {
        this.setupEventListeners();
        this.loadDemoSnippets();
    },

    setupEventListeners() {
        // Enter key in input (Ctrl+Enter to add)
        document.getElementById('capture-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.addSnippet();
            }
        });

        // Canvas mouse events for dragging
        const canvas = document.getElementById('canvas');
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Touch events for mobile
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // AI input
        document.getElementById('ai-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.askCustomAI();
            }
        });
    },

    addSnippet() {
        const input = document.getElementById('capture-input');
        const typeSelect = document.getElementById('snippet-type');
        const content = input.value.trim();

        if (!content) return;

        const snippet = {
            id: this.nextId++,
            content: content,
            type: typeSelect.value,
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            timestamp: new Date().toLocaleString()
        };

        this.snippets.push(snippet);
        this.renderSnippet(snippet);
        this.updateEmptyState();

        // Clear input
        input.value = '';
        input.focus();

        // Get AI suggestion for new snippet
        setTimeout(() => this.getContextualSuggestion(snippet), 500);
    },

    renderSnippet(snippet) {
        const canvas = document.getElementById('canvas');
        const snippetEl = document.createElement('div');
        snippetEl.className = `snippet snippet-${snippet.type}`;
        snippetEl.style.left = `${snippet.x}px`;
        snippetEl.style.top = `${snippet.y}px`;
        snippetEl.dataset.id = snippet.id;

        const typeIcons = {
            concept: '💡', character: '👤', scene: '🎬', world: '🌍',
            dialogue: '💬', theme: '🎯', question: '❓', mood: '🎨'
        };

        snippetEl.innerHTML = `
            <div class="snippet-header">
                <div class="snippet-type">${typeIcons[snippet.type]} ${snippet.type.charAt(0).toUpperCase() + snippet.type.slice(1)}</div>
                <div class="snippet-actions">
                    <button class="snippet-action" onclick="BrainstormApp.expandSnippet(${snippet.id})" title="Expand">🔍</button>
                    <button class="snippet-action" onclick="BrainstormApp.deleteSnippet(${snippet.id})" title="Delete">✕</button>
                </div>
            </div>
            <div class="snippet-content">${snippet.content}</div>
            <div class="snippet-timestamp">${snippet.timestamp}</div>
        `;

        canvas.appendChild(snippetEl);
    },

    // Mouse Events
    handleMouseDown(e) {
        const snippet = e.target.closest('.snippet');
        if (!snippet) return;

        this.startDrag(snippet, e.clientX, e.clientY);
        e.preventDefault();
    },

    handleMouseMove(e) {
        if (!this.isDragging || !this.currentSnippet) return;
        this.dragSnippet(e.clientX, e.clientY);
    },

    handleMouseUp(e) {
        this.endDrag();
    },

    // Touch Events
    handleTouchStart(e) {
        const snippet = e.target.closest('.snippet');
        if (!snippet) return;

        const touch = e.touches[0];
        this.startDrag(snippet, touch.clientX, touch.clientY);
        e.preventDefault();
    },

    handleTouchMove(e) {
        if (!this.isDragging || !this.currentSnippet) return;
        const touch = e.touches[0];
        this.dragSnippet(touch.clientX, touch.clientY);
        e.preventDefault();
    },

    handleTouchEnd(e) {
        this.endDrag();
    },

    // Drag Logic
    startDrag(snippet, clientX, clientY) {
        this.isDragging = true;
        this.currentSnippet = snippet;
        snippet.classList.add('dragging');

        const rect = snippet.getBoundingClientRect();
        this.dragOffset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    },

    dragSnippet(clientX, clientY) {
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        const x = clientX - canvasRect.left - this.dragOffset.x;
        const y = clientY - canvasRect.top - this.dragOffset.y;

        this.currentSnippet.style.left = `${Math.max(0, x)}px`;
        this.currentSnippet.style.top = `${Math.max(0, y)}px`;

        // Update snippet data
        const snippetId = parseInt(this.currentSnippet.dataset.id);
        const snippet = this.snippets.find(s => s.id === snippetId);
        if (snippet) {
            snippet.x = x;
            snippet.y = y;
        }
    },

    endDrag() {
        if (this.currentSnippet) {
            this.currentSnippet.classList.remove('dragging');
            this.currentSnippet = null;
        }
        this.isDragging = false;
    },

    expandSnippet(id) {
        const snippet = this.snippets.find(s => s.id === id);
        if (!snippet) return;

        // Simulate AI expansion based on snippet type
        const expansions = {
            character: [
                "What if this character has a hidden past that conflicts with their current role?",
                "Consider this character's greatest fear and how it drives their decisions.",
                "How would this character react under extreme pressure?"
            ],
            scene: [
                "This scene could be the turning point where everything changes.",
                "What if you added a time constraint to increase tension?",
                "Consider what each character wants to hide in this scene."
            ],
            world: [
                "Consider the deeper implications of this world rule on society.",
                "How does this world element affect daily life for ordinary people?",
                "What are the unintended consequences of this world feature?"
            ],
            dialogue: [
                "This dialogue suggests unspoken tension between the characters.",
                "What is each character not saying in this exchange?",
                "How does this dialogue reveal character motivation?"
            ],
            concept: [
                "How could you push this concept to its logical extreme?",
                "What would happen if this concept were reversed?",
                "Who would oppose this concept and why?"
            ],
            theme: [
                "How does this theme manifest in your character relationships?",
                "What symbols could represent this theme throughout your story?",
                "How might this theme create internal conflict for your protagonist?"
            ],
            question: [
                "This question could drive your entire plot structure.",
                "What are all the possible answers to this question?",
                "Who in your story would answer this question differently?"
            ],
            mood: [
                "How could you intensify this mood through setting details?",
                "What sensory elements would enhance this mood?",
                "How might this mood shift throughout your story?"
            ]
        };

        const typeExpansions = expansions[snippet.type] || [
            "Interesting idea! How might this connect to your larger story?",
            "Consider the implications of this element on your plot.",
            "What conflicts could arise from this idea?"
        ];

        const expansion = typeExpansions[Math.floor(Math.random() * typeExpansions.length)];
        this.addAISuggestion(`💡 Expanding "${snippet.content.substring(0, 30)}...": ${expansion}`);
    },

    deleteSnippet(id) {
        const snippetEl = document.querySelector(`[data-id="${id}"]`);
        if (snippetEl) {
            snippetEl.remove();
            this.snippets = this.snippets.filter(s => s.id !== id);
            this.updateEmptyState();
        }
    },

    getAISuggestions(type) {
        if (this.snippets.length === 0) {
            this.addAISuggestion("Add some snippets first, then I can help you explore them!");
            return;
        }

        const suggestions = {
            expand: [
                "Your character snippet suggests they need a compelling backstory flaw.",
                "That scene concept could work better with higher stakes - what if failure means losing everything?",
                "The world detail you mentioned raises questions about how magic affects daily life.",
                "Consider adding a ticking clock element to increase urgency.",
                "What if this idea had unintended consequences that create new problems?"
            ],
            connect: [
                "Your character and scene snippets could combine - what if the character's fear drives them into that exact situation?",
                "The mood and world snippets share themes of isolation - explore that connection.",
                "Your dialogue snippet reveals character motivation that could tie to your theme.",
                "Notice how your question snippet could be answered through your scene snippet.",
                "The world-building elements could explain why your character acts this way."
            ],
            challenge: [
                "What if your main character was wrong about their fundamental belief?",
                "Challenge: Could this story work if you flipped the gender/age/role of your protagonist?",
                "Devil's advocate: Why would readers care about this conflict in today's world?",
                "What if the opposite of your concept were true instead?",
                "How would your story change if it happened 100 years ago or 100 years from now?"
            ]
        };

        const suggestion = suggestions[type][Math.floor(Math.random() * suggestions[type].length)];
        this.addAISuggestion(`🤖 ${type.charAt(0).toUpperCase() + type.slice(1)}: ${suggestion}`);
    },

    getContextualSuggestion(snippet) {
        const contextSuggestions = {
            character: "Consider: What does this character want most? What do they fear most? These opposing forces create compelling conflict.",
            scene: "Scene development: What emotions should the reader feel here? What changes by the end of this scene?",
            world: "World building: How does this detail affect how people live, love, work, or die in your world?",
            dialogue: "Dialogue insight: What's the subtext here? What are they really saying underneath the words?",
            concept: "Concept exploration: How could this idea create both opportunity and danger for your characters?",
            theme: "Theme development: How does this theme create internal conflicts for your characters?",
            question: "Story question: This could be a central question that drives your entire narrative.",
            mood: "Atmospheric detail: How could you weave this mood throughout multiple scenes?"
        };

        const suggestion = contextSuggestions[snippet.type] || "Interesting idea! How might this connect to your larger story?";
        this.addAISuggestion(`💭 About your ${snippet.type}: ${suggestion}`);
    },

    askCustomAI() {
        const input = document.getElementById('ai-input');
        const question = input.value.trim();
        if (!question) return;

        // Simulate AI analysis based on current snippets
        const responses = this.generateAIResponse(question);
        this.addAISuggestion(`🤖 AI Response: ${responses}`);
        input.value = '';
    },

    generateAIResponse(question) {
        const lowerQ = question.toLowerCase();
        
        if (lowerQ.includes('connect') || lowerQ.includes('relationship')) {
            const characters = this.snippets.filter(s => s.type === 'character');
            const scenes = this.snippets.filter(s => s.type === 'scene');
            if (characters.length > 0 && scenes.length > 0) {
                return "I see potential connections between your character and scene snippets. Consider how your character's personality would drive them into these specific situations.";
            }
            return "To explore connections, try adding both character and scene snippets, then look for ways they could influence each other.";
        }
        
        if (lowerQ.includes('story') || lowerQ.includes('plot')) {
            const concepts = this.snippets.filter(s => s.type === 'concept');
            const questions = this.snippets.filter(s => s.type === 'question');
            if (concepts.length > 0 || questions.length > 0) {
                return "Your concept and question snippets suggest the foundation for a compelling story. Consider which elements create the most conflict and tension.";
            }
            return "For story development, start with concept or question snippets that explore 'what if' scenarios.";
        }
        
        if (lowerQ.includes('character')) {
            const chars = this.snippets.filter(s => s.type === 'character');
            if (chars.length > 1) {
                return "With multiple character snippets, think about their relationships, conflicts, and how they would clash or complement each other.";
            }
            return "Character development tip: Every compelling character needs both a driving desire and a fundamental flaw that gets in their way.";
        }
        
        if (lowerQ.includes('theme')) {
            const themes = this.snippets.filter(s => s.type === 'theme');
            if (themes.length > 0) {
                return "Your theme snippets provide the emotional backbone of your story. Make sure every other element serves or challenges these themes.";
            }
            return "Theme emerges from the conflicts and choices your characters face. What universal human experiences are you exploring?";
        }
        
        // General response based on snippet composition
        const typeCount = [...new Set(this.snippets.map(s => s.type))].length;
        if (typeCount >= 4) {
            return "You have good variety in your snippets! Look for ways to weave these different elements together into a cohesive narrative.";
        } else if (this.snippets.length > 5) {
            return "You have plenty of raw material. Consider organizing similar snippets together to see patterns and connections.";
        } else {
            return "Keep adding diverse snippet types. The more elements you have, the more unexpected connections you'll discover.";
        }
    },

    addAISuggestion(text) {
        const suggestionsEl = document.getElementById('ai-suggestions');
        const suggestionEl = document.createElement('div');
        suggestionEl.className = 'ai-suggestion';
        suggestionEl.textContent = text;
        
        suggestionsEl.appendChild(suggestionEl);
        suggestionsEl.scrollTop = suggestionsEl.scrollHeight;

        // Remove old suggestions to keep it manageable
        const suggestions = suggestionsEl.querySelectorAll('.ai-suggestion');
        if (suggestions.length > 8) {
            suggestions[0].remove();
        }
    },

    organizeSnippets() {
        // Smart auto-organize by type with better positioning
        const types = [...new Set(this.snippets.map(s => s.type))];
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        const cols = Math.ceil(Math.sqrt(types.length));
        const colWidth = (canvasRect.width - 100) / cols;
        
        types.forEach((type, typeIndex) => {
            const typeSnippets = this.snippets.filter(s => s.type === type);
            const col = typeIndex % cols;
            const row = Math.floor(typeIndex / cols);
            
            typeSnippets.forEach((snippet, index) => {
                snippet.x = col * colWidth + 50;
                snippet.y = row * 220 + index * 150 + 50;
                
                const snippetEl = document.querySelector(`[data-id="${snippet.id}"]`);
                if (snippetEl) {
                    snippetEl.style.left = `${snippet.x}px`;
                    snippetEl.style.top = `${snippet.y}px`;
                }
            });
        });

        this.addAISuggestion("🔗 Organized by type! Notice any new connections between nearby snippets?");
    },

    clearCanvas() {
        if (confirm('Clear all snippets? This cannot be undone.')) {
            this.snippets = [];
            document.getElementById('canvas').innerHTML = '<div class="empty-state" id="empty-state"><h3>Your Creative Canvas</h3><p>Start by adding snippets of ideas in the sidebar. Drag them around to explore connections and let the AI help you develop them further.</p></div>';
            document.getElementById('ai-suggestions').innerHTML = '<div class="ai-suggestion">Add some snippets and I\'ll help you explore connections, expand ideas, and discover new possibilities!</div>';
        }
    },

    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = this.snippets.length > 0 ? 'none' : 'block';
        }
    },

    loadDemoSnippets() {
        // Add a few demo snippets with better positioning
        const demos = [
            { content: "A lighthouse keeper who hears voices in storm sounds", type: "character", x: 100, y: 100 },
            { content: "What if the voices are from shipwreck victims across different time periods?", type: "question", x: 400, y: 150 },
            { content: "The lighthouse beam creates temporal rifts during storms", type: "world", x: 250, y: 280 },
            { content: "\"I can hear them calling across the years\"", type: "dialogue", x: 150, y: 400 }
        ];

        demos.forEach(demo => {
            const snippet = {
                id: this.nextId++,
                content: demo.content,
                type: demo.type,
                x: demo.x,
                y: demo.y,
                timestamp: new Date().toLocaleString()
            };
            this.snippets.push(snippet);
            this.renderSnippet(snippet);
        });

        this.updateEmptyState();
        
        // Add initial AI insight
        setTimeout(() => {
            this.addAISuggestion("👋 Welcome! I see you have some lighthouse-themed snippets. These suggest a story about time, memory, and supernatural communication. Try adding a theme snippet about \"connection across time\" to tie them together.");
        }, 1000);
    },

    // Additional utility methods
    getSnippetsByType(type) {
        return this.snippets.filter(s => s.type === type);
    },

    findNearbySnippets(targetSnippet, radius = 200) {
        return this.snippets.filter(s => {
            if (s.id === targetSnippet.id) return false;
            const distance = Math.sqrt(
                Math.pow(s.x - targetSnippet.x, 2) + 
                Math.pow(s.y - targetSnippet.y, 2)
            );
            return distance <= radius;
        });
    }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    BrainstormApp.init();
});