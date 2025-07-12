const { Observable } = require('@nativescript/core');

class EditorManager extends Observable {
  constructor(fileSystem) {
    super();
    this._tabs = [];
    this._activeTabId = null;
    this._fileSystem = fileSystem;
    
    // Basic syntax highlighting patterns (discoverable enhancement)
    this._syntaxPatterns = {
      // keywords: /\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/g,
      // strings: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g,
      // comments: /\/\/.*$/gm
    };
    
    this.set('tabs', this._tabs);
    this.set('activeTab', null);
  }

  get tabs() {
    return this._tabs;
  }

  get activeTab() {
    return this._tabs.find(tab => tab.id === this._activeTabId) || null;
  }

  // Basic auto-indentation (can be enhanced)
  applyAutoIndent(text, cursorPosition) {
    // Simple auto-indent logic
    const lines = text.split('\n');
    const currentLineIndex = text.substring(0, cursorPosition).split('\n').length - 1;
    const currentLine = lines[currentLineIndex];
    
    // Basic indentation rules
    if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith('(')) {
      return '  '; // Add 2 spaces for indentation
    }
    
    return '';
  }

  // Hidden advanced syntax highlighting (discoverable)
  /*
  applySyntaxHighlighting(text) {
    let highlightedText = text;
    
    // Apply syntax highlighting patterns
    for (const [type, pattern] of Object.entries(this._syntaxPatterns)) {
      highlightedText = highlightedText.replace(pattern, (match) => {
        return `<span class="syntax-${type}">${match}</span>`;
      });
    }
    
    return highlightedText;
  }

  addSyntaxPattern(name, pattern) {
    this._syntaxPatterns[name] = pattern;
  }

  enableAdvancedFeatures() {
    // Code folding, bracket matching, etc.
    console.log("Advanced editor features enabled!");
  }
  */

  async openFile(path) {
    const existingTab = this._tabs.find(tab => tab.path === path);
    if (existingTab) {
      this.setActiveTab(existingTab.id);
      return;
    }

    try {
      const content = await this._fileSystem.readFile(path);
      const fileName = path.split('/').pop() || path;
      const tabId = this.generateTabId();

      const newTab = {
        id: tabId,
        name: fileName,
        path: path,
        content: content,
        isDirty: false,
        isActive: true
      };

      this._tabs.forEach(tab => tab.isActive = false);
      this._tabs.push(newTab);
      this._activeTabId = tabId;
      
      this.set('tabs', this._tabs);
      this.set('activeTab', newTab);
      
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }

  closeTab(tabId) {
    const tabIndex = this._tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;

    const tab = this._tabs[tabIndex];
    
    if (tab.isDirty) {
      this.saveTab(tabId);
    }

    this._tabs.splice(tabIndex, 1);

    if (this._activeTabId === tabId) {
      if (this._tabs.length > 0) {
        const newActiveTab = this._tabs[Math.min(tabIndex, this._tabs.length - 1)];
        this.setActiveTab(newActiveTab.id);
      } else {
        this._activeTabId = null;
        this.set('activeTab', null);
      }
    }

    this.set('tabs', this._tabs);
  }

  setActiveTab(tabId) {
    this._tabs.forEach(tab => tab.isActive = tab.id === tabId);
    this._activeTabId = tabId;
    this.set('activeTab', this.activeTab);
  }

  updateTabContent(tabId, content) {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      tab.content = content;
      tab.isDirty = true;
      this.set('tabs', this._tabs);
    }
  }

  async saveTab(tabId) {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      try {
        await this._fileSystem.writeFile(tab.path, tab.content);
        tab.isDirty = false;
        this.set('tabs', this._tabs);
      } catch (error) {
        console.error('Failed to save file:', error);
      }
    }
  }

  async saveAllTabs() {
    const dirtyTabs = this._tabs.filter(tab => tab.isDirty);
    for (const tab of dirtyTabs) {
      await this.saveTab(tab.id);
    }
  }

  generateTabId() {
    return 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = { EditorManager };