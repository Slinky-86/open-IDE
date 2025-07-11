import { Observable } from '@nativescript/core';
import { FileSystemManager } from './file-system';

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
  isActive: boolean;
}

export class EditorManager extends Observable {
  private _tabs: EditorTab[] = [];
  private _activeTabId: string | null = null;
  private _fileSystem: FileSystemManager;
  private _customCommands: Map<string, Function> = new Map();

  constructor(fileSystem: FileSystemManager) {
    super();
    this._fileSystem = fileSystem;
  }

  get tabs(): EditorTab[] {
    return this._tabs;
  }

  get activeTab(): EditorTab | null {
    return this._tabs.find(tab => tab.id === this._activeTabId) || null;
  }

  // Allow runtime addition of custom commands
  addCommand(name: string, handler: Function): void {
    this._customCommands.set(name, handler);
  }

  executeCommand(name: string, ...args: any[]): any {
    const command = this._customCommands.get(name);
    if (command) {
      return command(...args);
    }
    throw new Error(`Command '${name}' not found`);
  }

  getCommands(): string[] {
    return Array.from(this._customCommands.keys());
  }

  async openFile(path: string): Promise<void> {
    const existingTab = this._tabs.find(tab => tab.path === path);
    if (existingTab) {
      this.setActiveTab(existingTab.id);
      return;
    }

    try {
      const content = await this._fileSystem.readFile(path);
      const fileName = path.split('/').pop() || path;
      const tabId = this.generateTabId();

      const newTab: EditorTab = {
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

  closeTab(tabId: string): void {
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

  setActiveTab(tabId: string): void {
    this._tabs.forEach(tab => tab.isActive = tab.id === tabId);
    this._activeTabId = tabId;
    this.notifyPropertyChange('activeTab', this.activeTab);
  }

  updateTabContent(tabId: string, content: string): void {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      tab.content = content;
      tab.isDirty = true;
      this.notifyPropertyChange('tabs', this._tabs);
    }
  }

  async saveTab(tabId: string): Promise<void> {
    const tab = this._tabs.find(tab => tab.id === tabId);
    if (tab) {
      try {
        await this._fileSystem.writeFile(tab.path, tab.content);
        tab.isDirty = false;
        this.notifyPropertyChange('tabs', this._tabs);
      } catch (error) {
        console.error('Failed to save file:', error);
      }
    }
  }

  async saveAllTabs(): Promise<void> {
    const dirtyTabs = this._tabs.filter(tab => tab.isDirty);
    for (const tab of dirtyTabs) {
      await this.saveTab(tab.id);
    }
  }

  private generateTabId(): string {
    return 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
