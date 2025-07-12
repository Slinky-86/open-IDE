const { Observable } = require('@nativescript/core');
const { FileSystemManager } = require('../models/file-system.js');
const { EditorManager } = require('../models/editor-manager.js');
const { RuntimeExecutor } = require('../models/runtime-executor.js');

class MainViewModel extends Observable {
  constructor() {
    super();
    
    this._fileSystem = new FileSystemManager();
    this._editorManager = new EditorManager(this._fileSystem);
    this._runtimeExecutor = new RuntimeExecutor(this._fileSystem);
    this._sidebarVisible = true;
    this._consoleVisible = false;
    
    this.initializeApp();
  }

  get fileSystem() {
    return this._fileSystem;
  }

  get editorManager() {
    return this._editorManager;
  }

  get runtimeExecutor() {
    return this._runtimeExecutor;
  }

  get sidebarVisible() {
    return this._sidebarVisible;
  }

  set sidebarVisible(value) {
    if (this._sidebarVisible !== value) {
      this._sidebarVisible = value;
      this.notifyPropertyChange('sidebarVisible', value);
    }
  }

  get consoleVisible() {
    return this._consoleVisible;
  }

  set consoleVisible(value) {
    if (this._consoleVisible !== value) {
      this._consoleVisible = value;
      this.notifyPropertyChange('consoleVisible', value);
    }
  }

  async initializeApp() {
    try {
      // Set up global context for runtime modifications
      const globalContext = {
        fileSystem: this._fileSystem,
        editor: this._editorManager,
        executor: this._runtimeExecutor,
        ui: null, // Will be set when page is loaded
        // Hidden build system activation flag
        enableBuildSystem: false // Users must discover and set this to true
      };
      
      this._runtimeExecutor.setGlobalContext(globalContext);
      
      // Load extensions after initialization - delayed for hot reload
      setTimeout(() => {
        this._runtimeExecutor.loadExtensions();
      }, 1000);
      
      // Open welcome file by default
      if (this._editorManager.tabs.length === 0) {
        await this._editorManager.openFile('welcome.js');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  // Expose this method to allow UI reference setting
  setUIReference(uiRef) {
    const context = global.app;
    if (context) {
      context.ui = uiRef;
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleConsole() {
    this.consoleVisible = !this.consoleVisible;
  }

  async executeCurrentFile() {
    const activeTab = this._editorManager.activeTab;
    if (activeTab) {
      await this._runtimeExecutor.executeCode(activeTab.content);
      this.consoleVisible = true;
    }
  }

  async refreshApp() {
    try {
      // Save all open files
      await this._editorManager.saveAllTabs();
      
      // Reload file system
      await this._fileSystem.loadFileTree();
      
      // Reload extensions for hot reload
      await this._runtimeExecutor.loadExtensions();
      
      // Check if build system should be activated (hidden feature)
      if (global.app && global.app.enableBuildSystem) {
        const { BuildSystemController } = require('./build-system-ui.js');
        if (!global.app.buildSystem) {
          const buildSystem = new BuildSystemController();
          await buildSystem.initialize();
          global.app.buildSystem = buildSystem;
          console.log('🎯 Hidden build system discovered and activated!');
        }
      }
      
      console.log('App refreshed - hot reload complete');
    } catch (error) {
      console.error('Failed to refresh app:', error);
    }
  }

  async createNewFile() {
    const fileName = `new-file-${Date.now()}.js`;
    const defaultContent = `// New JavaScript file
// Write your code here and execute it!

console.log("Hello from ${fileName}!");

// Access the global app context
if (global.app) {
  console.log("Available commands:", global.app.editor.getCommands());
}
`;
    
    await this._fileSystem.createFile(fileName, defaultContent);
    await this._editorManager.openFile(fileName);
  }
}

module.exports = { MainViewModel };
