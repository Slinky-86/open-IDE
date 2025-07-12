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
        if (global.openIDE._viewModel) {
          global.openIDE._viewModel.hotReload();
        }
      },
      
      // Basic utilities
      log: (...args) => {
        console.log(...args);
      },
      
      // Hidden reference for advanced features
      _ui: null,
      _viewModel: null,
      _advanced: null
    };
    
    console.log('🚀 Open-IDE Runtime API ready!');
    console.log('📖 Use global.openIDE to access functionality');
    console.log('🔥 Try: global.openIDE.hotReload() for instant updates');
  }

  // Hidden advanced API (discoverable by uncommenting)
  /*
  exposeAdvancedAPI() {
    global.openIDE._advanced = {
      // Plugin system
      plugins: {
        _registry: new Map(),
        
        register: (name, plugin) => {
          global.openIDE._advanced.plugins._registry.set(name, plugin);
          console.log(`🔌 Plugin '${name}' registered`);
          
          if (plugin.init && typeof plugin.init === 'function') {
            plugin.init(global.openIDE);
          }
          
          if (plugin.hotReload && typeof plugin.hotReload === 'function') {
            console.log(`🔥 Plugin '${name}' supports hot reload`);
          }
        },
        
        get: (name) => {
          return global.openIDE._advanced.plugins._registry.get(name);
        },
        
        list: () => {
          return Array.from(global.openIDE._advanced.plugins._registry.keys());
        },
        
        hotReload: (name) => {
          const plugin = global.openIDE._advanced.plugins._registry.get(name);
          if (plugin && plugin.hotReload) {
            plugin.hotReload(global.openIDE);
            console.log(`🔥 Hot reloaded plugin: ${name}`);
          }
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
        },
        
        modifyEditor: (modifications) => {
          console.log('🎨 Modifying editor:', modifications);
          // Apply editor modifications
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
        },
        
        loadFromFile: async (filePath) => {
          try {
            const code = await global.openIDE.readFile(filePath);
            global.openIDE._advanced.extensions.load(code);
            console.log(`🔧 Extension loaded from: ${filePath}`);
          } catch (error) {
            console.error(`❌ Failed to load extension from ${filePath}:`, error);
          }
        }
      },
      
      // Hot reload system
      hotReload: {
        addWatcher: (pattern, callback) => {
          console.log(`👁️ Watching files matching: ${pattern}`);
          // Add file watcher
        },
        
        triggerReload: (reason = 'manual') => {
          console.log(`🔥 Hot reload triggered: ${reason}`);
          global.openIDE.hotReload();
        }
      }
    };
    
    console.log('🔧 Advanced API features unlocked!');
    console.log('🔌 Plugin system available');
    console.log('🎨 UI modification tools ready');
    console.log('🔧 Extension loader active');
  }

  // Common plugins (commented out for discovery)
  loadCommonPlugins() {
    // File Tree Enhanced Plugin
    const fileTreePlugin = {
      name: 'File Tree Enhanced',
      version: '1.0.0',
      init: (api) => {
        api.fileTree = {
          refresh: () => {
            console.log('🌳 File tree refreshed');
            api._viewModel.fileSystem.loadFileTree();
          },
          search: (query) => {
            console.log(`🔍 Searching for: ${query}`);
            const results = api.listFiles().filter(file => 
              file.name.toLowerCase().includes(query.toLowerCase())
            );
            console.log(`Found ${results.length} files`);
            return results;
          },
          filter: (type) => {
            console.log(`📁 Filtering by: ${type}`);
            return api.listFiles().filter(file => file.type === type);
          }
        };
      },
      hotReload: (api) => {
        console.log('🔥 File Tree plugin hot reloaded');
      }
    };
    
    // Code Formatter Plugin
    const formatterPlugin = {
      name: 'Code Formatter',
      version: '1.0.0',
      init: (api) => {
        api.format = {
          javascript: (code) => {
            // Basic JS formatting
            return code
              .replace(/;/g, ';\n')
              .replace(/{/g, '{\n')
              .replace(/}/g, '\n}')
              .replace(/,/g, ',\n');
          },
          json: (code) => {
            try {
              return JSON.stringify(JSON.parse(code), null, 2);
            } catch (e) {
              return code;
            }
          },
          minify: (code) => {
            return code.replace(/\s+/g, ' ').trim();
          }
        };
      },
      hotReload: (api) => {
        console.log('🔥 Code Formatter plugin hot reloaded');
      }
    };
    
    // Live Preview Plugin
    const livePreviewPlugin = {
      name: 'Live Preview',
      version: '1.0.0',
      init: (api) => {
        api.preview = {
          start: () => {
            console.log('👁️ Live preview started');
          },
          stop: () => {
            console.log('⏹️ Live preview stopped');
          },
          refresh: () => {
            console.log('🔄 Live preview refreshed');
          }
        };
      },
      hotReload: (api) => {
        console.log('🔥 Live Preview plugin hot reloaded');
      }
    };
    
    // Register plugins
    if (global.openIDE._advanced) {
      global.openIDE._advanced.plugins.register('fileTree', fileTreePlugin);
      global.openIDE._advanced.plugins.register('formatter', formatterPlugin);
      global.openIDE._advanced.plugins.register('livePreview', livePreviewPlugin);
      
      console.log('🔌 Common plugins loaded and ready for hot reload!');
    }
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
        openIDE: global.openIDE,
        require: require
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
    this.notifyPropertyChange('history', this._history);
    
    return result;
  }

  clearHistory() {
    this._history = [];
    this.set('history', this._history);
    this.notifyPropertyChange('history', this._history);
  }
}

module.exports = { RuntimeExecutor };