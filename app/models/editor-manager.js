const { Observable } = require('@nativescript/core');

class EditorManager extends Observable {
  constructor(fileSystem) {
    super();
    this._tabs = [];
    this._activeTabId = null;
    this._fileSystem = fileSystem;
    
    // Basic syntax highlighting patterns (hot-reloadable)
    this._syntaxPatterns = {
      keywords: /\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await|try|catch|finally)\b/g,
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

  // Basic auto-indentation (hot-reloadable)
  applyAutoIndent(text, cursorPosition) {
    const lines = text.split('\n');
    const currentLineIndex = text.substring(0, cursorPosition).split('\n').length - 1;
    const currentLine = lines[currentLineIndex];
    
    // Basic indentation rules
    if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith('(') || currentLine.trim().endsWith('[')) {
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

  // Basic syntax highlighting (hot-reloadable)
  applySyntaxHighlighting(text) {
    // This is a basic implementation that can be enhanced via hot reload
    let highlighted = text;
    
    // Apply basic highlighting patterns
    Object.keys(this._syntaxPatterns).forEach(type => {
      const pattern = this._syntaxPatterns[type];
      highlighted = highlighted.replace(pattern, (match) => {
        return `[${type}]${match}[/${type}]`;
      });
    });
    
    return highlighted;
  }

  // Hidden advanced syntax highlighting (discoverable by uncommenting)
  /*
  enableAdvancedSyntaxHighlighting() {
    this._syntaxPatterns = {
      ...this._syntaxPatterns,
      functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
      operators: /[+\-*\/%=<>!&|^~?:]/g,
      brackets: /[{}[\]()]/g,
      properties: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      globals: /\b(global|window|document|console|require|module|exports)\b/g,
      types: /\b(string|number|boolean|object|array|function|undefined|null)\b/g
    };
    console.log("🎨 Advanced syntax highlighting enabled!");
    return this;
  }

  enableCodeFolding() {
    this._codeFolding = true;
    console.log("📁 Code folding enabled!");
    return this;
  }

  enableBracketMatching() {
    this._bracketMatching = true;
    console.log("🔗 Bracket matching enabled!");
    return this;
  }

  enableAutoComplete() {
    this._autoComplete = {
      keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export'],
      globals: ['global', 'console', 'require', 'module', 'exports', 'setTimeout', 'setInterval'],
      openIDE: ['createFile', 'readFile', 'writeFile', 'deleteFile', 'execute', 'hotReload']
    };
    console.log("💡 Auto-complete enabled!");
    return this;
  }

  enableLivePreview() {
    this._livePreview = true;
    console.log("👁️ Live preview enabled!");
    return this;
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
      this.notifyPropertyChange('tabs', this._tabs);
      this.notifyPropertyChange('activeTab', newTab);
      
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
    this.notifyPropertyChange('tabs', this._tabs);
  }

  setActiveTab(tabId) {
    this._tabs.forEach(tab => tab.isActive = tab.id === tabId);
    this._activeTabId = tabId;
    const activeTab = this.activeTab;
    this.set('activeTab', activeTab);
    this.notifyPropertyChange('activeTab', activeTab);
  }

  updateTabContent(tabId, content) {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      tab.content = content;
      tab.isDirty = true;
      this.set('tabs', this._tabs);
      this.notifyPropertyChange('tabs', this._tabs);
    }
  }

  async saveTab(tabId) {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      try {
        await this._fileSystem.writeFile(tab.path, tab.content);
        tab.isDirty = false;
        this.set('tabs', this._tabs);
        this.notifyPropertyChange('tabs', this._tabs);
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