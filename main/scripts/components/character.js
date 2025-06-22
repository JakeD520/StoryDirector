// components/character.js
// Complete Characters Component for StoryDirector

const CharactersComponent = {
    // Component data
    characters: [
        {
            id: 'sarah',
            name: 'Sarah Thompson',
            fullName: 'Sarah Thompson',
            role: 'protagonist',
            age: 28,
            voiceFormula: 'Co₈ + Dx₆ + El₅ + Rg₃',
            voiceSample: '"Need to get there. Fast. Over by the rocks."',
            background: 'Former lighthouse keeper\'s daughter who moved to the city five years ago. Practical, direct, haunted by unresolved family conflicts.',
            traits: ['Practical', 'Spatial-aware', 'Direct', 'Compressed speech']
        },
        {
            id: 'marcus',
            name: 'Marcus Chen',
            fullName: 'Marcus Chen',
            role: 'supporting',
            age: 30,
            voiceFormula: 'Sb₇ + Mt₆ + Rg₈ + Md₇',
            voiceSample: '"I find myself contemplating whether this situation might unfold like a house of cards."',
            background: 'Academic turned entrepreneur. Speaks in complex, metaphorical language. Sarah\'s former friend with unresolved history.',
            traits: ['Intellectual', 'Metaphorical', 'Formal', 'Uncertain']
        },
        {
            id: 'narrator',
            name: 'The Narrator',
            fullName: 'The Omniscient Narrator',
            role: 'narrator',
            age: null,
            voiceFormula: 'Sb₆ + Mt₅ + Im₆ + Ps₅',
            voiceSample: '"Time, as Sarah would later understand, had a way of folding back on itself in coastal towns."',
            background: 'Third-person limited narrator with subtle omniscient hints. Philosophical undertones with coastal imagery.',
            traits: ['Philosophical', 'Observant', 'Poetic', 'Knowing']
        }
    ],

    relationships: [
        { 
            from: 'sarah', 
            to: 'marcus', 
            type: 'Former Friends', 
            description: 'Complicated history with unresolved tension from their shared past' 
        },
        { 
            from: 'sarah', 
            to: 'narrator', 
            type: 'Observer/Subject', 
            description: 'The narrator follows Sarah\'s journey with philosophical distance and intimate knowledge' 
        }
    ],

    currentView: 'overview',
    selectedCharacter: null,

    // Initialize the component
    init() {
        console.log('Initializing Characters Component...');
        this.renderOverviewStats();
        this.renderCharactersGrid();
        this.renderRelationshipsWeb();
        this.renderRelationshipsList();
        this.setupEventListeners();
        
        // Notify main app that component is ready
        if (window.StoryDirectorApp) {
            window.StoryDirectorApp.componentReady('characters');
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Window resize handler for responsive relationship web
        window.addEventListener('resize', () => {
            if (this.currentView === 'overview') {
                setTimeout(() => this.renderRelationshipsWeb(), 100);
            }
        });
    },

    // Render overview statistics
    renderOverviewStats() {
        const protagonistCount = this.characters.filter(c => c.role === 'protagonist').length;
        const narratorCount = this.characters.filter(c => c.role === 'narrator').length;

        document.getElementById('total-characters').textContent = this.characters.length;
        document.getElementById('protagonist-count').textContent = protagonistCount;
        document.getElementById('relationship-count').textContent = this.relationships.length;
        document.getElementById('narrator-count').textContent = narratorCount;
    },

    // Render characters grid
    renderCharactersGrid() {
        const container = document.getElementById('characters-grid');
        if (!container) return;

        container.innerHTML = '';

        if (this.characters.length === 0) {
            container.innerHTML = `
                <div class="empty-characters">
                    <h3>No Characters Yet</h3>
                    <p>Start building your story by creating your first character.</p>
                    <button class="btn" onclick="CharactersComponent.createNewCharacter()" style="margin-top: 20px;">
                        + Create First Character
                    </button>
                </div>
            `;
            return;
        }

        this.characters.forEach(character => {
            const card = this.createCharacterCard(character);
            container.appendChild(card);
        });
    },

    // Create a character card element
    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = `character-card ${character.role}`;
        
        const roleIcons = {
            protagonist: '👤',
            antagonist: '🦹',
            supporting: '👥',
            narrator: '🎙️',
            ensemble: '👪'
        };

        card.innerHTML = `
            <div class="character-actions">
                <div class="action-icon" onclick="CharactersComponent.editCharacter('${character.id}')" title="Edit">✏️</div>
                <div class="action-icon" onclick="CharactersComponent.duplicateCharacter('${character.id}')" title="Duplicate">📋</div>
                <div class="action-icon" onclick="CharactersComponent.deleteCharacter('${character.id}')" title="Delete">🗑️</div>
            </div>
            
            <div class="character-header">
                <div class="character-avatar ${character.role}">
                    ${roleIcons[character.role] || character.name.charAt(0)}
                </div>
                <div class="character-info">
                    <div class="character-name">${character.name}</div>
                    <div class="character-role">${character.role}</div>
                </div>
            </div>
            
            <div class="voice-formula">${character.voiceFormula}</div>
            
            <div class="voice-preview">${character.voiceSample}</div>
            
            <div class="character-traits">
                ${character.traits.map(trait => `<div class="trait-tag">${trait}</div>`).join('')}
            </div>
        `;

        // Add click handler for character details
        card.addEventListener('click', (e) => {
            // Don't open details if clicking on action buttons
            if (!e.target.closest('.action-icon')) {
                this.showCharacterDetails(character.id);
            }
        });

        return card;
    },

    // Render relationships web visualization
    renderRelationshipsWeb() {
        const container = document.getElementById('relationships-web');
        if (!container) return;

        container.innerHTML = '';

        // Only show web if we have multiple characters
        if (this.characters.length < 2) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-dim); font-style: italic;">
                    Add more characters to see relationship connections
                </div>
            `;
            return;
        }

        // Position characters in a circle
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        const radius = Math.min(centerX, centerY) - 40;

        this.characters.forEach((character, index) => {
            const angle = (index / this.characters.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle) - 30;
            const y = centerY + radius * Math.sin(angle) - 30;

            const node = document.createElement('div');
            node.className = `relationship-node ${character.role}`;
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            node.textContent = character.name.charAt(0);
            node.title = character.name;

            // Add click handler
            node.addEventListener('click', () => {
                this.highlightCharacterConnections(character.id);
            });

            container.appendChild(node);
        });

        // Draw relationship lines
        this.relationships.forEach(rel => {
            const fromIndex = this.characters.findIndex(c => c.id === rel.from);
            const toIndex = this.characters.findIndex(c => c.id === rel.to);

            if (fromIndex !== -1 && toIndex !== -1) {
                this.drawRelationshipLine(container, fromIndex, toIndex, this.characters.length, centerX, centerY, radius);
            }
        });
    },

    // Draw a relationship line between two characters
    drawRelationshipLine(container, fromIndex, toIndex, totalChars, centerX, centerY, radius) {
        const angle1 = (fromIndex / totalChars) * 2 * Math.PI;
        const angle2 = (toIndex / totalChars) * 2 * Math.PI;

        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        const line = document.createElement('div');
        line.className = 'relationship-line';
        line.style.width = `${length}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;

        container.appendChild(line);
    },

    // Render relationships list
    renderRelationshipsList() {
        const container = document.getElementById('relationships-list');
        if (!container) return;

        container.innerHTML = '';

        if (this.relationships.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-dim); font-style: italic; padding: 20px;">
                    No relationships defined yet. Character interactions will appear here.
                </div>
            `;
            return;
        }

        this.relationships.forEach((rel, index) => {
            const fromChar = this.characters.find(c => c.id === rel.from);
            const toChar = this.characters.find(c => c.id === rel.to);

            if (fromChar && toChar) {
                const item = document.createElement('div');
                item.className = 'relationship-item';
                item.innerHTML = `
                    <div class="relationship-dynamic">
                        ${fromChar.name} ↔ ${toChar.name}: ${rel.type}
                        <div style="float: right;">
                            <button class="action-icon" onclick="CharactersComponent.editRelationship(${index})" title="Edit">✏️</button>
                            <button class="action-icon" onclick="CharactersComponent.removeRelationship(${index})" title="Remove">✕</button>
                        </div>
                    </div>
                    <div class="relationship-description">${rel.description}</div>
                `;
                container.appendChild(item);
            }
        });
    },

    // Highlight connections for a specific character
    highlightCharacterConnections(characterId) {
        // Remove previous highlights
        document.querySelectorAll('.relationship-line').forEach(line => {
            line.classList.remove('highlighted');
        });

        document.querySelectorAll('.relationship-node').forEach(node => {
            node.classList.remove('highlighted');
        });

        // Find related relationships
        const relatedRelationships = this.relationships.filter(rel => 
            rel.from === characterId || rel.to === characterId
        );

        if (relatedRelationships.length > 0) {
            // Highlight the clicked character
            const characterNode = Array.from(document.querySelectorAll('.relationship-node'))
                .find(node => node.title === this.characters.find(c => c.id === characterId)?.name);
            if (characterNode) {
                characterNode.classList.add('highlighted');
            }

            // Show info about connections
            const character = this.characters.find(c => c.id === characterId);
            const connectionInfo = relatedRelationships.map(rel => {
                const otherCharId = rel.from === characterId ? rel.to : rel.from;
                const otherChar = this.characters.find(c => c.id === otherCharId);
                return `${rel.type} with ${otherChar?.name}`;
            }).join(', ');

            console.log(`${character?.name} connections: ${connectionInfo}`);
        }
    },

    // Character management functions
    createNewCharacter() {
        alert('Character Creation\n\nThis would open the character creation workflow with:\n• Basic info form\n• Voice chemistry designer\n• Trait selection\n• Background builder');
    },

    editCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (character) {
            alert(`Edit Character: ${character.name}\n\nThis would open the character editor with all fields populated for modification.`);
        }
    },

    duplicateCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (character) {
            const newCharacter = {
                ...character,
                id: `${character.id}_copy_${Date.now()}`,
                name: `${character.name} (Copy)`
            };
            this.characters.push(newCharacter);
            this.refreshAllDisplays();
            console.log(`Duplicated character: ${character.name}`);
        }
    },

    deleteCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (character && confirm(`Delete ${character.name}?\n\nThis will also remove all relationships involving this character.`)) {
            // Remove character
            this.characters = this.characters.filter(c => c.id !== characterId);
            
            // Remove related relationships
            this.relationships = this.relationships.filter(rel => 
                rel.from !== characterId && rel.to !== characterId
            );
            
            this.refreshAllDisplays();
            console.log(`Deleted character: ${character.name}`);
        }
    },

    showCharacterDetails(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (character) {
            alert(`Character Details: ${character.name}\n\nRole: ${character.role}\nVoice: ${character.voiceFormula}\nBackground: ${character.background}\n\nThis would open a detailed character view modal.`);
        }
    },

    // Relationship management functions
    showRelationshipsView() {
        alert('Relationship Management\n\nThis would open a dedicated view for:\n• Creating new relationships\n• Editing relationship types\n• Managing character dynamics\n• Relationship timeline tracking');
    },

    editRelationship(index) {
        const relationship = this.relationships[index];
        if (relationship) {
            alert(`Edit Relationship\n\nType: ${relationship.type}\nDescription: ${relationship.description}\n\nThis would open the relationship editor.`);
        }
    },

    removeRelationship(index) {
        const relationship = this.relationships[index];
        if (relationship && confirm(`Remove this relationship?\n\n${relationship.type}: ${relationship.description}`)) {
            this.relationships.splice(index, 1);
            this.refreshAllDisplays();
        }
    },

    // Voice chemistry functions
    openVoiceDesigner() {
        document.getElementById('voice-designer-modal').style.display = 'flex';
    },

    closeVoiceDesigner() {
        document.getElementById('voice-designer-modal').style.display = 'none';
    },

    applyVoiceFormula() {
        alert('Voice Formula Applied!\n\nIn the full implementation, this would:\n• Apply the new V2P formula to the character\n• Update voice samples automatically\n• Regenerate character speech patterns\n• Update consistency across the project');
        this.closeVoiceDesigner();
    },

    // Modal functions
    closeCharacterModal() {
        document.getElementById('character-modal').style.display = 'none';
    },

    // Utility functions
    refreshAllDisplays() {
        this.renderOverviewStats();
        this.renderCharactersGrid();
        this.renderRelationshipsWeb();
        this.renderRelationshipsList();
    },

    // Export character data
    exportCharacters() {
        const exportData = {
            characters: this.characters,
            relationships: this.relationships,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'story-characters.json';
        link.click();
        
        console.log('Characters exported successfully');
    },

    // Import character data
    importCharacters(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            if (importData.characters && Array.isArray(importData.characters)) {
                this.characters = importData.characters;
                if (importData.relationships && Array.isArray(importData.relationships)) {
                    this.relationships = importData.relationships;
                }
                this.refreshAllDisplays();
                console.log('Characters imported successfully');
            }
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed. Please check the file format.');
        }
    }
};

// Global interface for component integration
window.CharactersComponent = CharactersComponent;

// Auto-initialize if this script is loaded after the DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('characters-grid')) {
            CharactersComponent.init();
        }
    });
} else {
    // DOM is already ready
    if (document.getElementById('characters-grid')) {
        CharactersComponent.init();
    }
}