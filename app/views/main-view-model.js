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
    
    // Initialize properties
    this.set('fileSystem', this._fileSystem);
    this.set('editorManager', this._editorManager);
    this.set('runtimeExecutor', this._runtimeExecutor);
    
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

  async initializeApp() {
    try {
      console.log('Initializing Open-IDE...');
      
      // Set up global context for runtime modifications
      const globalContext = {
        fileSystem: this._fileSystem,
        editor: this._editorManager,
        executor: this._runtimeExecutor,
        ui: null // Will be set when page is loaded
      };
      
      this._runtimeExecutor.setGlobalContext(globalContext);
      
      // Load extensions after initialization
      setTimeout(() => {
        this._runtimeExecutor.loadExtensions();
      }, 2000);
      
      console.log('Open-IDE initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  setUIReference(uiRef) {
    const context = global.app;
    if (context) {
      context.ui = uiRef;
    }
  }

  async executeCurrentFile() {
    const activeTab = this._editorManager.activeTab;
    if (activeTab) {
      await this._runtimeExecutor.executeCode(activeTab.content);
    } else {
      await this._runtimeExecutor.executeCode('console.log("No file selected. Open a file to execute code.");');
    }
  }

  async refreshApp() {
    try {
      console.log('Refreshing Open-IDE...');
      
      // Save all open files
      await this._editorManager.saveAllTabs();
      
      // Reload file system
      await this._fileSystem.loadFileTree();
      
      // Reload extensions for hot reload
      await this._runtimeExecutor.loadExtensions();
      
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
  console.log("IDE is ready!");
  console.log("Available API:", Object.keys(global.IDE || {}));
}

// Example: Extend the IDE
if (global.IDE) {
  global.IDE.ui.showMessage("File created successfully!");
}
`;
    
    await this._fileSystem.createFile(fileName, defaultContent);
    await this._editorManager.openFile(fileName);
  }
}

module.exports = { MainViewModel };