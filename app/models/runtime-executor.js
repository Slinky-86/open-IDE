const { Observable } = require('@nativescript/core');

class RuntimeExecutor extends Observable {
  constructor(fileSystem) {
    super();
    this._history = [];
    this._fileSystem = fileSystem;
    this._globalContext = {};
    
    // Initialize with empty state
    this.notifyPropertyChange('history', this._history);
  }

  get history() {
    return this._history;
  }

  // Set global app context for runtime modifications
  setGlobalContext(context) {
    this._globalContext = context;
    // Make it globally accessible
    global.app = context;
    
    // Expose runtime API for Theia-like functionality
    this.exposeRuntimeAPI();
  }

  // Expose public API for runtime modifications (like Theia)
  exposeRuntimeAPI() {
    // Create global IDE API
    global.IDE = {
      // File System API
      fs: {
        readFile: async (path) => {
          return await this._fileSystem.readFile(path);
        },
        writeFile: async (path, content) => {
          await this._fileSystem.writeFile(path, content);
          await this._fileSystem.loadFileTree(); // Refresh UI
        },
        createFile: async (path, content = '') => {
          await this._fileSystem.createFile(path, content);
        },
        deleteFile: async (path) => {
          await this._fileSystem.deleteFile(path);
        },
        listFiles: () => {
          return this._fileSystem.fileTree;
        }
      },
      
      // Editor API
      editor: {
        openFile: async (path) => {
          await this._globalContext.editor.openFile(path);
        },
        getCurrentFile: () => {
          return this._globalContext.editor.activeTab;
        },
        getContent: () => {
          const tab = this._globalContext.editor.activeTab;
          return tab ? tab.content : '';
        },
        setContent: (content) => {
          const tab = this._globalContext.editor.activeTab;
          if (tab) {
            this._globalContext.editor.updateTabContent(tab.id, content);
          }
        },
        saveFile: async () => {
          const tab = this._globalContext.editor.activeTab;
          if (tab) {
            await this._globalContext.editor.saveTab(tab.id);
          }
        },
        addCommand: (name, handler) => {
          this._globalContext.editor.addCommand(name, handler);
        },
        executeCommand: (name, ...args) => {
          return this._globalContext.editor.executeCommand(name, ...args);
        }
      },
      
      // UI API
      ui: {
        showMessage: (message) => {
          alert(message);
        },
        addMenuItem: (text, callback) => {
          this.addMenuItem(text, callback);
        },
        modifyElement: (id, properties) => {
          this.modifyUI(id, properties);
        },
        getElement: (id) => {
          if (this._globalContext.ui && this._globalContext.ui.page) {
            return this._globalContext.ui.page.getViewById(id);
          }
          return null;
        }
      },
      
      // Runtime API
      runtime: {
        execute: async (code) => {
          return await this.executeCode(code);
        },
        executeFile: async (path) => {
          return await this.executeFile(path);
        },
        getHistory: () => {
          return this._history;
        },
        clearHistory: () => {
          this.clearHistory();
        }
      },
      
      // Plugin API
      plugins: {
        register: (name, plugin) => {
          if (!global.IDE._plugins) {
            global.IDE._plugins = new Map();
          }
          global.IDE._plugins.set(name, plugin);
          console.log(`Plugin '${name}' registered`);
          
          // Auto-initialize if plugin has init method
          if (plugin.init && typeof plugin.init === 'function') {
            plugin.init(global.IDE);
          }
        },
        get: (name) => {
          return global.IDE._plugins ? global.IDE._plugins.get(name) : null;
        },
        list: () => {
          return global.IDE._plugins ? Array.from(global.IDE._plugins.keys()) : [];
        }
      },
      
      // Events API
      events: {
        on: (event, handler) => {
          if (!global.IDE._events) {
            global.IDE._events = new Map();
          }
          if (!global.IDE._events.has(event)) {
            global.IDE._events.set(event, []);
          }
          global.IDE._events.get(event).push(handler);
        },
        emit: (event, data) => {
          if (global.IDE._events && global.IDE._events.has(event)) {
            global.IDE._events.get(event).forEach(handler => {
              try {
                handler(data);
              } catch (error) {
                console.error(`Event handler error for '${event}':`, error);
              }
            });
          }
        }
      }
    };
    
    // Backward compatibility
    global.app.api = global.IDE;
    
    console.log('🚀 IDE Runtime API exposed globally!');
    console.log('📖 Use global.IDE to access all functionality');
    console.log('💡 Example: global.IDE.editor.openFile("welcome.js")');
  }

  async executeCode(code) {
    const result = {
      output: '',
      timestamp: new Date()
    };

    try {
      // Capture console output
      const originalLog = console.log;
      const originalError = console.error;
      let output = '';
      
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog.apply(console, args);
      };
      
      console.error = (...args) => {
        output += 'ERROR: ' + args.join(' ') + '\n';
        originalError.apply(console, args);
      };

      // Create execution context with access to app components
      const context = {
        ...this._globalContext,
        console: console,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        require: this.createRequireFunction(),
        global: global,
        // Utility functions for runtime modifications
        addMenuItem: this.addMenuItem.bind(this),
        modifyUI: this.modifyUI.bind(this),
        extendEditor: this.extendEditor.bind(this)
      };

      // Execute code with full context access - using Function constructor for hot reload
      const func = new Function('context', `
        with (context) {
          ${code}
        }
      `);
      
      const executionResult = func(context);
      
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      
      result.output = output || (executionResult !== undefined ? String(executionResult) : 'Code executed successfully');
      
    } catch (error) {
      result.error = error.message;
      result.output = `Execution error: ${error.message}`;
    }

    this._history.push(result);
    this.notifyPropertyChange('history', this._history);
    
    return result;
  }

  async executeFile(filePath) {
    try {
      const code = await this._fileSystem.readFile(filePath);
      return await this.executeCode(code);
    } catch (error) {
      return {
        output: `Failed to execute file: ${error.message}`,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Load and execute app extensions
  async loadExtensions() {
    try {
      const extensionFile = 'app-extensions.js';
      const result = await this.executeFile(extensionFile);
      console.log('Extensions loaded:', result.output);
    } catch (error) {
      console.log('No extensions file found or failed to load');
    }
  }

  clearHistory() {
    this._history = [];
    this.notifyPropertyChange('history', this._history);
  }

  // Helper functions for runtime modifications
  createRequireFunction() {
    return (moduleName) => {
      // Basic module system for user extensions
      switch (moduleName) {
        case '@nativescript/core':
          return require('@nativescript/core');
        default:
          throw new Error(`Module '${moduleName}' not found`);
      }
    };
  }

  addMenuItem(text, callback) {
    // Allow users to add custom menu items
    if (this._globalContext.ui && this._globalContext.ui.page) {
      const { ActionItem } = require('@nativescript/core');
      const actionItem = new ActionItem();
      actionItem.text = text;
      actionItem.on('tap', callback);
      this._globalContext.ui.page.actionBar.actionItems.addItem(actionItem);
      console.log(`Added menu item: ${text}`);
    }
  }

  modifyUI(selector, modifications) {
    // Allow users to modify UI elements
    if (this._globalContext.ui && this._globalContext.ui.page) {
      const element = this._globalContext.ui.page.getViewById(selector);
      if (element) {
        Object.assign(element, modifications);
        console.log(`Modified UI element: ${selector}`);
      }
    }
  }

  extendEditor(extensionName, handler) {
    // Allow users to extend editor functionality
    if (this._globalContext.editor) {
      this._globalContext.editor.addCommand(extensionName, handler);
      console.log(`Extended editor with: ${extensionName}`);
    }
  }
}

module.exports = { RuntimeExecutor };
