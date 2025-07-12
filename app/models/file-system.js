const { Observable, knownFolders, File, Folder } = require('@nativescript/core');

class FileSystemManager extends Observable {
  constructor() {
    super();
    this._rootPath = knownFolders.documents().path + '/open-ide';
    this._fileTree = [];
    this._isLoading = true;
    
    // Initialize properties
    this.set('fileTree', this._fileTree);
    this.set('isLoading', this._isLoading);
    
    this.initializeWorkspace();
  }

  get fileTree() {
    return this._fileTree;
  }

  get isLoading() {
    return this._isLoading;
  }

  get rootPath() {
    return this._rootPath;
  }

  async initializeWorkspace() {
    try {
      console.log('Initializing workspace...');
      this.set('isLoading', true);
      
      if (!Folder.exists(this._rootPath)) {
        await this.ensureDirectoryExists(this._rootPath);
        await this.createInitialFiles();
      }
      await this.loadFileTree();
      
      this.set('isLoading', false);
      console.log('Workspace initialized');
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
      this.set('isLoading', false);
    }
  }

  async ensureDirectoryExists(path) {
    try {
      const dummyFile = File.fromPath(path + '/.dummy');
      await dummyFile.writeText('');
      await dummyFile.remove();
    } catch (error) {
      // Directory creation failed, but that's okay
    }
  }

  async createInitialFiles() {
    const initialFiles = [
      { 
        path: 'welcome.js', 
        content: `// Welcome to Open-IDE!
// A complete mobile IDE with runtime extensibility

console.log("🚀 Welcome to Open-IDE!");
console.log("📱 Mobile development environment");
console.log("⚡ Runtime code execution");
console.log("🔧 Extensible architecture");

// Example: Access the global IDE API
if (global.IDE) {
  console.log("✅ IDE API is available!");
  console.log("Available modules:", Object.keys(global.IDE));
} else {
  console.log("⏳ IDE API loading...");
}

// Example function
function greetUser() {
  const message = "Hello from Open-IDE! 🎉";
  console.log(message);
  return message;
}

// Execute the function
greetUser();

// Try modifying this code and hitting the execute button!`
      },
      { 
        path: 'app-extensions.js', 
        content: `// App Extensions - Runtime Modifications
// This file allows you to extend and customize the IDE at runtime

console.log("🔧 Loading app extensions...");

// Wait for IDE to be ready
if (global.app && global.IDE) {
  console.log("✅ IDE context available");
  
  // Example: Add a custom editor command
  global.IDE.editor.addCommand('uppercase', (content) => {
    return content.toUpperCase();
  });
  
  // Example: Add a custom menu item
  global.IDE.ui.addMenuItem("Custom Action", () => {
    global.IDE.ui.showMessage("Custom action executed!");
  });
  
  // Example: Register a plugin
  global.IDE.plugins.register('myPlugin', {
    name: 'My Custom Plugin',
    version: '1.0.0',
    init: (ide) => {
      console.log("🔌 Custom plugin initialized!");
    },
    customFunction: () => {
      console.log("🎯 Custom plugin function called!");
    }
  });
  
  console.log("🎉 Extensions loaded successfully!");
} else {
  console.log("⏳ Waiting for IDE to initialize...");
  
  // Retry after a delay
  setTimeout(() => {
    if (global.IDE) {
      console.log("🔄 Retrying extension loading...");
      // Re-run extension code here
    }
  }, 1000);
}`
      },
      {
        path: 'tutorial.md',
        content: `# Open-IDE Tutorial

## Welcome to Open-IDE! 🚀

A complete mobile IDE that runs on your phone with runtime extensibility.

### Features
- 📁 File management system
- ✏️ Multi-tab code editor
- ▶️ Runtime code execution
- 🔧 Hot reload and live modifications
- 🔌 Plugin system
- 🌐 Global API access

### Getting Started

1. **Explore Files**: Tap files in the sidebar to open them
2. **Edit Code**: Modify code in the editor
3. **Execute**: Use the ▶️ button to run your code
4. **See Output**: Check the console for results
5. **Extend**: Modify \`app-extensions.js\` to customize the IDE

### Global API

Access the IDE programmatically:

\`\`\`javascript
// File operations
global.IDE.fs.readFile('welcome.js')
global.IDE.fs.writeFile('test.js', 'console.log("Hello!");')

// Editor operations
global.IDE.editor.openFile('welcome.js')
global.IDE.editor.setContent('new content')

// UI operations
global.IDE.ui.showMessage('Hello!')
global.IDE.ui.addMenuItem('Custom', () => {})

// Runtime operations
global.IDE.runtime.execute('console.log("test")')
\`\`\`

### Creating Extensions

Create new \`.js\` files with your extensions:

\`\`\`javascript
// my-extension.js
global.IDE.plugins.register('myExtension', {
  init: (ide) => {
    console.log('Extension loaded!');
  }
});
\`\`\`

### Hot Reload

Use the refresh button (⟲) to reload all extensions and see changes immediately!

Happy coding! 🎉`
      },
      {
        path: 'examples.js',
        content: `// Open-IDE Examples
// Demonstrating the capabilities of the mobile IDE

console.log("📚 Running Open-IDE examples...");

// Example 1: Basic JavaScript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("🔢 Fibonacci(10):", fibonacci(10));

// Example 2: Working with the IDE API
if (global.IDE) {
  console.log("🔧 IDE API Examples:");
  
  // Get current file info
  const currentFile = global.IDE.editor.getCurrentFile();
  if (currentFile) {
    console.log("📄 Current file:", currentFile.name);
  }
  
  // List available commands
  const commands = global.IDE.editor.getCommands ? global.IDE.editor.getCommands() : [];
  console.log("⚡ Available commands:", commands);
}

// Example 3: Async operations
async function asyncExample() {
  console.log("⏳ Starting async operation...");
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log("✅ Async operation completed!");
}

asyncExample();

// Example 4: Error handling
try {
  throw new Error("This is a test error");
} catch (error) {
  console.log("🚨 Caught error:", error.message);
}

console.log("🎉 Examples completed!");`
      }
    ];

    for (const file of initialFiles) {
      await this.createFile(file.path, file.content);
    }
  }

  async loadFileTree() {
    this._fileTree = await this.buildFileTree(this._rootPath);
    this.set('fileTree', this._fileTree);
  }

  async buildFileTree(folderPath) {
    const nodes = [];
    
    if (!Folder.exists(folderPath)) return nodes;

    try {
      const folder = Folder.fromPath(folderPath);
      const entities = await folder.getEntities();
      
      for (const entity of entities) {
        const relativePath = entity.path.replace(this._rootPath + '/', '');
        
        if (entity instanceof Folder) {
          nodes.push({
            name: entity.name,
            path: relativePath,
            type: 'folder',
            children: await this.buildFileTree(entity.path),
            isExpanded: false
          });
        } else if (entity instanceof File) {
          nodes.push({
            name: entity.name,
            path: relativePath,
            type: 'file'
          });
        }
      }
    } catch (error) {
      console.error('Error building file tree:', error);
    }

    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
  }

  async readFile(relativePath) {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    return await file.readText();
  }

  async writeFile(relativePath, content) {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    await file.writeText(content);
  }

  async createFile(relativePath, content = '') {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    
    const parentPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
    if (!Folder.exists(parentPath)) {
      await this.ensureDirectoryExists(parentPath);
    }
    
    await file.writeText(content);
    await this.loadFileTree();
  }

  async deleteFile(relativePath) {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    if (File.exists(fullPath)) {
      await file.remove();
      await this.loadFileTree();
    }
  }
}

module.exports = { FileSystemManager };