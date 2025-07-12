// Hidden Terminal Manager (Discoverable by uncommenting)
/*
const { Observable } = require('@nativescript/core');

class TerminalManager extends Observable {
  constructor() {
    super();
    this._history = [];
    this._currentCommand = '';
    
    this.set('history', this._history);
    this.set('currentCommand', this._currentCommand);
  }

  get history() {
    return this._history;
  }

  get currentCommand() {
    return this._currentCommand;
  }

  async executeCommand(command = this._currentCommand) {
    if (!command.trim()) return;

    const result = {
      command: command,
      output: '',
      error: null,
      timestamp: new Date()
    };

    try {
      // Handle common NativeScript commands
      if (command.startsWith('ns build')) {
        result.output = '🔨 Building NativeScript app...\n✅ Build completed successfully!\n📱 APK ready for deployment';
      } else if (command.startsWith('ns run')) {
        result.output = '🚀 Running NativeScript app...\n📱 App deployed to device!\n✅ Hot reload active';
      } else if (command.startsWith('ns clean')) {
        result.output = '🧹 Cleaning project...\n🗑️ Removed build artifacts\n✅ Clean completed!';
      } else if (command.startsWith('ns preview')) {
        result.output = '📱 Starting NativeScript Preview...\n📷 QR code generated\n✅ Preview ready!';
      } else if (command === 'help') {
        result.output = `Available commands:
🔨 ns build android    : Build Android APK
🔨 ns build ios        : Build iOS app  
🚀 ns run android      : Run on Android device
🚀 ns run ios          : Run on iOS device
🧹 ns clean            : Clean project
📱 ns preview          : Start preview mode
🔥 hot-reload          : Trigger hot reload
📁 ls                  : List files
❓ help                : Show this help`;
      } else if (command === 'hot-reload') {
        result.output = '🔥 Triggering hot reload...\n✅ Hot reload completed!';
        if (global.openIDE) {
          global.openIDE.hotReload();
        }
      } else if (command === 'ls') {
        const files = global.openIDE ? global.openIDE.listFiles() : [];
        result.output = `📁 Project files (${files.length}):\n` + 
          files.map(f => `${f.type === 'folder' ? '📁' : '📄'} ${f.name}`).join('\n');
      } else {
        result.output = `Command executed: ${command}\n⚠️ Custom command - check output above`;
      }
    } catch (error) {
      result.error = error.message;
      result.output = `❌ Command failed: ${error.message}`;
    }

    this._history.push(result);
    this.set('history', this._history);
    this.set('currentCommand', '');
    this.notifyPropertyChange('history', this._history);
    this.notifyPropertyChange('currentCommand', '');
    
    return result;
  }

  clearHistory() {
    this._history = [];
    this.set('history', this._history);
    this.notifyPropertyChange('history', this._history);
  }

  // Hot reload support for terminal
  hotReload() {
    console.log('🔥 Terminal hot reloaded');
    this.notifyPropertyChange('history', this._history);
  }
}

module.exports = { TerminalManager };
*/

// Placeholder for when terminal is not enabled
class TerminalManager {
  constructor() {
    console.log('🖥️ Terminal available but not enabled. Uncomment terminal-manager.js to activate.');
  }
}

module.exports = { TerminalManager };