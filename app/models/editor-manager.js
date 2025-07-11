const { Observable } = require('@nativescript/core');

class EditorManager extends Observable {
  constructor(fileSystem) {
    super();
    this._tabs = [];
    this._activeTabId = null;
    this._fileSystem = fileSystem;
    this._customCommands = new Map();
  }

  get tabs() {
    return this._tabs;
  }

  get activeTab() {
    return this._tabs.find(tab => tab.id === this._activeTabId) || null;
  }

  // Allow runtime addition of custom commands
  addCommand(name, handler) {
    this._customCommands.set(name, handler);
    console.log(`Added custom command: ${name}`);
  }

  executeCommand(name, ...args) {
    const command = this._customCommands.get(name);
    if (command) {
      return command(...args);
    }
    throw new Error(`Command '${name}' not found`);
  }

  getCommands() {
    return Array.from(this._customCommands.keys());
  }

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
      }
    }

    this.notifyPropertyChange('tabs', this._tabs);
    this.notifyPropertyChange('activeTab', this.activeTab);
  }

  setActiveTab(tabId) {
    this._tabs.forEach(tab => tab.isActive = tab.id === tabId);
    this._activeTabId = tabId;
    this.notifyPropertyChange('activeTab', this.activeTab);
  }

  updateTabContent(tabId, content) {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      tab.content = content;
      tab.isDirty = true;
      this.notifyPropertyChange('tabs', this._tabs);
    }
  }

  async saveTab(tabId) {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      try {
        await this._fileSystem.writeFile(tab.path, tab.content);
        tab.isDirty = false;
        this.notifyPropertyChange('tabs', this._tabs);
        console.log(`Saved: ${tab.name}`);
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
