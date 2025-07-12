const { Observable } = require('@nativescript/core');

class EditorManager extends Observable {
  constructor(fileSystem) {
    super();
    this._tabs = [];
    this._activeTabId = null;
    this._fileSystem = fileSystem;
    
    // Basic syntax highlighting patterns
    this._syntaxPatterns = {
      keywords: /\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await)\b/g,
      strings: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g,
      comments: /\/\/.*$/gm,
      numbers: /\b\d+(\.\d+)?\b/g
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

  // Basic auto-indentation
  applyAutoIndent(text, cursorPosition) {
    const lines = text.split('\n');
    const currentLineIndex = text.substring(0, cursorPosition).split('\n').length - 1;
    const currentLine = lines[currentLineIndex];
    
    // Basic indentation rules
    if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith('(')) {
      return '  '; // Add 2 spaces for indentation
    }
    
    // Match previous line indentation
    if (currentLineIndex > 0) {
      const previousLine = lines[currentLineIndex - 1];
      const match = previousLine.match(/^(\s*)/);
      return match ? match[1] : '';
    }
    
    return '';
  }

  // Basic syntax highlighting (can be enhanced)
  applySyntaxHighlighting(text) {
    // This is a basic implementation
    // In a real editor, you'd use a proper syntax highlighter
    return text; // For now, return as-is
  }

  // Hidden advanced syntax highlighting (discoverable)
  /*
  enableAdvancedSyntaxHighlighting() {
    this._syntaxPatterns = {
      ...this._syntaxPatterns,
      functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
      operators: /[+\-*/%=<>!&|^~?:]/g,
      brackets: /[{}[\]()]/g,
      properties: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    };
    console.log("🎨 Advanced syntax highlighting enabled!");
  }

  enableCodeFolding() {
    console.log("📁 Code folding enabled!");
  }

  enableBracketMatching() {
    console.log("🔗 Bracket matching enabled!");
  }

  enableAutoComplete() {
    console.log("💡 Auto-complete enabled!");
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