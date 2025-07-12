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
    
    // Welcome text for clean start
    this._welcomeText = `// Welcome to Open-IDE! 🚀
// A mobile development environment with hot reload

// Getting Started:
// 1. Create files using the + button
// 2. Write your code here
// 3. Use the ▶️ button to execute
// 4. Use ⟲ to hot reload your changes

// Hot Reload API:
// Modify this code and hit refresh to see changes!

console.log("Open-IDE is ready!");

// Access the runtime API:
if (global.openIDE) {
  console.log("Runtime API available!");
  console.log("Available methods:", Object.keys(global.openIDE));
}

// Example: Create a new file programmatically
// global.openIDE.createFile('my-script.js', 'console.log("Hello!");');

// Start building your mobile development environment!`;
    
    // Initialize properties
    this.set('fileSystem', this._fileSystem);
    this.set('editorManager', this._editorManager);
    this.set('runtimeExecutor', this._runtimeExecutor);
    this.set('welcomeText', this._welcomeText);
    
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

  get welcomeText() {
    return this._welcomeText;
  }

  async initializeApp() {
    try {
      // Set up basic runtime API
      this._runtimeExecutor.exposeBasicAPI();
      
      // Load any existing extensions (hidden feature)
      // this.loadHiddenExtensions();
      
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
      
      console.log('✅ Hot reload complete!');
    } catch (error) {
      console.error('❌ Hot reload failed:', error);
    }
  }

  async executeAutoReloadScripts() {
    // Look for files that should auto-execute on reload
    const autoReloadFiles = this._fileSystem.fileTree.filter(file => 
      file.name.includes('auto-reload') || file.name.includes('hot-reload')
    );
    
    for (const file of autoReloadFiles) {
      try {
        const content = await this._fileSystem.readFile(file.path);
        await this._runtimeExecutor.executeCode(content);
      } catch (error) {
        console.log(`Auto-reload skipped for ${file.name}`);
      }
    }
  }

  async createNewFile() {
    const fileName = `script-${Date.now()}.js`;
    const defaultContent = `// New JavaScript file
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
}

// Your code here...
`;
    
    await this._fileSystem.createFile(fileName, defaultContent);
    await this._editorManager.openFile(fileName);
  }

  // Hidden advanced features (discoverable)
  /*
  async loadHiddenExtensions() {
    try {
      const extensionFiles = this._fileSystem.fileTree.filter(file => 
        file.name.includes('extension') || file.name.includes('plugin')
      );
      
      for (const file of extensionFiles) {
        const content = await this._fileSystem.readFile(file.path);
        await this._runtimeExecutor.executeCode(content);
      }
    } catch (error) {
      // Extensions not found or failed to load
    }
  }

  async openSettings() {
    // Settings panel functionality
    console.log("Settings panel - implement custom settings here");
  }

  async executeTerminalCommand() {
    // Terminal command execution
    console.log("Terminal command execution - implement CLI features here");
  }
  */
}

module.exports = { MainViewModel };