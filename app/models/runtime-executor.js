const { Observable } = require('@nativescript/core');

class RuntimeExecutor extends Observable {
  constructor(fileSystem) {
    super();
    this._history = [];
    this._fileSystem = fileSystem;
    
    this.set('history', this._history);
  }

  get history() {
    return this._history;
  }

  exposeBasicAPI() {
    // Expose basic runtime API for hot reload and file operations
    global.openIDE = {
      // File operations
      createFile: async (path, content = '') => {
        await this._fileSystem.createFile(path, content);
        console.log(`✅ Created file: ${path}`);
      },
      
      readFile: async (path) => {
        return await this._fileSystem.readFile(path);
      },
      
      writeFile: async (path, content) => {
        await this._fileSystem.writeFile(path, content);
        console.log(`💾 Saved file: ${path}`);
      },
      
      deleteFile: async (path) => {
        await this._fileSystem.deleteFile(path);
        console.log(`🗑️ Deleted file: ${path}`);
      },
      
      listFiles: () => {
        return this._fileSystem.fileTree;
      },
      
      // Code execution
      execute: async (code) => {
        return await this.executeCode(code);
      },
      
      // Hot reload trigger
      hotReload: () => {
        console.log("🔥 Hot reload triggered via API");
        // Trigger hot reload functionality
      },
      
      // Basic utilities
      log: (...args) => {
        console.log(...args);
      },
      
      // Hidden reference for advanced features
      _ui: null,
      _advanced: null
    };
    
    console.log('🚀 Open-IDE Runtime API ready!');
    console.log('📖 Use global.openIDE to access functionality');
  }

  // Hidden advanced API (discoverable)
  /*
  exposeAdvancedAPI() {
    global.openIDE._advanced = {
      // Plugin system
      plugins: {
        register: (name, plugin) => {
          if (!global.openIDE._plugins) {
            global.openIDE._plugins = new Map();
          }
          global.openIDE._plugins.set(name, plugin);
          console.log(`🔌 Plugin '${name}' registered`);
          
          if (plugin.init && typeof plugin.init === 'function') {
            plugin.init(global.openIDE);
          }
        },
        
        get: (name) => {
          return global.openIDE._plugins ? global.openIDE._plugins.get(name) : null;
        },
        
        list: () => {
          return global.openIDE._plugins ? Array.from(global.openIDE._plugins.keys()) : [];
        }
      },
      
      // UI manipulation
      ui: {
        addTab: (title, content) => {
          console.log(`➕ Adding tab: ${title}`);
          // Add custom tab functionality
        },
        
        showDialog: (message, options = {}) => {
          alert(message);
        },
        
        addMenuItem: (text, callback) => {
          console.log(`📋 Adding menu item: ${text}`);
          // Add menu item functionality
        }
      },
      
      // Extension system
      extensions: {
        load: (extensionCode) => {
          try {
            const func = new Function('openIDE', extensionCode);
            func(global.openIDE);
            console.log('🔧 Extension loaded successfully');
          } catch (error) {
            console.error('❌ Extension failed to load:', error);
          }
        }
      }
    };
    
    console.log('🔧 Advanced API features unlocked!');
  }

  // Common plugins (commented out for discovery)
  loadCommonPlugins() {
    // File Tree Plugin
    const fileTreePlugin = {
      name: 'File Tree Enhanced',
      init: (api) => {
        api.fileTree = {
          refresh: () => console.log('🌳 File tree refreshed'),
          search: (query) => console.log(`🔍 Searching for: ${query}`),
          filter: (type) => console.log(`📁 Filtering by: ${type}`)
        };
      }
    };
    
    // Code Formatter Plugin
    const formatterPlugin = {
      name: 'Code Formatter',
      init: (api) => {
        api.format = {
          javascript: (code) => {
            // Basic JS formatting
            return code.replace(/;/g, ';\n').replace(/{/g, '{\n').replace(/}/g, '\n}');
          },
          json: (code) => {
            try {
              return JSON.stringify(JSON.parse(code), null, 2);
            } catch (e) {
              return code;
            }
          }
        };
      }
    };
    
    // Register plugins
    global.openIDE._advanced.plugins.register('fileTree', fileTreePlugin);
    global.openIDE._advanced.plugins.register('formatter', formatterPlugin);
  }
  */

  async executeCode(code) {
    const result = {
      output: '',
      timestamp: new Date()
    };

    try {
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

      const context = {
        console: console,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        global: global,
        openIDE: global.openIDE
      };

      const func = new Function('context', `
        with (context) {
          ${code}
        }
      `);
      
      const executionResult = func(context);
      
      console.log = originalLog;
      console.error = originalError;
      
      result.output = output || (executionResult !== undefined ? String(executionResult) : '✅ Code executed successfully');
      
    } catch (error) {
      result.error = error.message;
      result.output = `❌ Execution error: ${error.message}`;
    }

    this._history.push(result);
    this.set('history', this._history);
    
    return result;
  }

  clearHistory() {
    this._history = [];
    this.set('history', this._history);
  }
}

module.exports = { RuntimeExecutor };