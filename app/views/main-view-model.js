const { Observable } = require('@nativescript/core');
const { FileSystemManager } = require('../models/file-system.js');
const { EditorManager } = require('../models/editor-manager.js');
const { RuntimeExecutor } = require('../models/runtime-executor.js');
// const { TerminalManager } = require('../models/terminal-manager.js');

class MainViewModel extends Observable {
  constructor() {
    super();
    
    this._fileSystem = new FileSystemManager();
    this._editorManager = new EditorManager(this._fileSystem);
    this._runtimeExecutor = new RuntimeExecutor(this._fileSystem);
    // this._terminalManager = new TerminalManager();
    
    // Initialize properties
    this.set('fileSystem', this._fileSystem);
    this.set('editorManager', this._editorManager);
    this.set('runtimeExecutor', this._runtimeExecutor);
    // this.set('terminalManager', this._terminalManager);
    
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

  // get terminalManager() {
  //   return this._terminalManager;
  // }

  async initializeApp() {
    try {
      // Set up runtime API for hot reload
      this._runtimeExecutor.exposeBasicAPI();
      
      // Load any existing hot-reload scripts (hidden feature)
      // this.loadHotReloadExtensions();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  setUIReference(uiRef) {
    this._uiRef = uiRef;
    if (global.openIDE) {
      global.openIDE._ui = uiRef;
    }
  }

  async executeCurrentCode() {
    const activeTab = this._editorManager.activeTab;
    if (activeTab) {
      await this._runtimeExecutor.executeCode(activeTab.content);
    } else {
      await this._runtimeExecutor.executeCode('console.log("No file selected. Create a file to start coding!");');
    }
  }

  async hotReload() {
    try {
      console.log('🔥 Hot reloading...');
      
      // Save all open files
      await this._editorManager.saveAllTabs();
      
      // Reload file system
      await this._fileSystem.loadFileTree();
      
      // Re-execute any auto-reload scripts
      await this.executeAutoReloadScripts();
      
      // Trigger UI refresh
      this.notifyPropertyChange('fileSystem', this._fileSystem);
      this.notifyPropertyChange('editorManager', this._editorManager);
      
      console.log('✅ Hot reload complete!');
    } catch (error) {
      console.error('❌ Hot reload failed:', error);
    }
  }

  async executeAutoReloadScripts() {
    // Look for files that should auto-execute on reload
    const autoReloadFiles = this._fileSystem.fileTree.filter(file => 
      file.name.includes('auto-reload') || 
      file.name.includes('hot-reload') ||
      file.name.includes('extension')
    );
    
    for (const file of autoReloadFiles) {
      try {
        const content = await this._fileSystem.readFile(file.path);
        await this._runtimeExecutor.executeCode(content);
        console.log(`🔄 Auto-reloaded: ${file.name}`);
      } catch (error) {
        console.log(`⚠️ Auto-reload skipped for ${file.name}: ${error.message}`);
      }
    }
  }

  async createNewFile() {
    const fileName = `script-${Date.now()}.js`;
    const defaultContent = `// New JavaScript file - Hot reloadable!
// Write your code here and execute it!

console.log("Hello from ${fileName}!");

// Access Open-IDE API:
if (global.openIDE) {
  console.log("Open-IDE API ready!");
  
  // Example: Create another file
  // global.openIDE.createFile('test.js', 'console.log("Created!");');
  
  // Example: Read file content
  // const content = global.openIDE.readFile('${fileName}');
  // console.log('File content:', content);
  
  // Example: Hot reload trigger
  // global.openIDE.hotReload();
}

// Your hot-reloadable code here...
`;
    
    await this._fileSystem.createFile(fileName, defaultContent);
    await this._editorManager.openFile(fileName);
  }

  // Hidden advanced features (discoverable by uncommenting)
  /*
  async loadHotReloadExtensions() {
    try {
      const extensionFiles = this._fileSystem.fileTree.filter(file => 
        file.name.includes('extension') || 
        file.name.includes('plugin') ||
        file.name.includes('hot-reload')
      );
      
      for (const file of extensionFiles) {
        const content = await this._fileSystem.readFile(file.path);
        await this._runtimeExecutor.executeCode(content);
        console.log(`🔌 Loaded extension: ${file.name}`);
      }
    } catch (error) {
      console.log('No extensions found or failed to load');
    }
  }

  async enableAdvancedFeatures() {
    // Enable plugin system
    this._runtimeExecutor.exposeAdvancedAPI();
    
    // Enable terminal
    this._terminalManager = new (require('../models/terminal-manager.js')).TerminalManager();
    this.set('terminalManager', this._terminalManager);
    
    console.log('🚀 Advanced features enabled!');
  }
  */
}

module.exports = { MainViewModel };