const { Observable, knownFolders, File, Folder } = require('@nativescript/core');

class FileSystemManager extends Observable {
  constructor() {
    super();
    this._rootPath = knownFolders.documents().path + '/mobile-ide';
    this._fileTree = [];
    this.initializeWorkspace();
  }

  get fileTree() {
    return this._fileTree;
  }

  get rootPath() {
    return this._rootPath;
  }

  async initializeWorkspace() {
    try {
      const workspaceFolder = Folder.fromPath(this._rootPath);
      if (!Folder.exists(this._rootPath)) {
        Folder.fromPath(this._rootPath).createSync();
        await this.createInitialFiles();
      }
      await this.loadFileTree();
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
    }
  }

  async createInitialFiles() {
    const initialFiles = [
      { 
        path: 'welcome.js', 
        content: `// Welcome to Mobile IDE!
// This is your starting point for customization.

console.log("Welcome to Mobile IDE!");

// Example: Add your own functionality here
function customFunction() {
  return "Hello from custom code!";
}

// Try running this file to see the output
customFunction();`
      },
      { 
        path: 'app-extensions.js', 
        content: `// App Extensions - Runtime Modifications
// This file is loaded at startup and allows you to modify the IDE

// Access to the global app context
// global.app contains references to all managers and UI components

// Example: Add custom menu items, modify UI, extend functionality
// Your code here will be executed when the app starts

console.log("App extensions loaded!");

// Example: Add a custom editor command
if (global.app && global.app.editor) {
  global.app.editor.addCommand('uppercase', (content) => {
    return content.toUpperCase();
  });
  console.log("Added uppercase command to editor");
}

// Example: Add custom UI modifications
if (global.app && global.app.ui) {
  // You can modify UI elements here
  console.log("UI context available for modifications");
}`
      },
      {
        path: 'tutorial.md',
        content: `# Mobile IDE Runtime Modification Tutorial

## Getting Started

This IDE allows you to modify its own code at runtime using JavaScript! Here's how:

### 1. Understanding the Structure
- \`app-extensions.js\` - Your main customization file, loaded at startup
- \`welcome.js\` - Example file to get you started
- Any \`.js\` files you create can be executed and modify the IDE

### 2. Accessing IDE Components
The global \`app\` object provides access to:
- \`app.fileSystem\` - File management
- \`app.editor\` - Editor functionality  
- \`app.executor\` - Code execution
- \`app.ui\` - UI components and page references

### 3. Runtime Modifications
You can:
- Add new UI components
- Modify existing functionality
- Create custom commands
- Add new file types support
- Implement syntax highlighting
- Add debugging tools

### 4. Example Customizations

#### Add a custom button:
\`\`\`javascript
// In app-extensions.js
const { ActionItem } = require('@nativescript/core');
const page = global.app.ui.page;

const customAction = new ActionItem();
customAction.text = "Custom";
customAction.on("tap", () => {
  alert("Custom action triggered!");
});
page.actionBar.actionItems.addItem(customAction);
\`\`\`

#### Extend the editor:
\`\`\`javascript
// Add custom editor commands
global.app.editor.addCommand("format", (content) => {
  // Your formatting logic
  return formattedContent;
});
\`\`\`

#### Modify UI styling:
\`\`\`javascript
// Change editor appearance
const editor = global.app.ui.page.getViewById('editor-textarea');
if (editor) {
  editor.style.fontSize = 16;
  editor.style.backgroundColor = '#2d2d2d';
}
\`\`\`

### 5. Hot Reload
After making changes:
1. Save your files
2. Use the refresh button (⟲) or restart the app
3. Your changes will be applied immediately

### 6. Creating Plugins
Create new \`.js\` files with your extensions:

\`\`\`javascript
// my-plugin.js
(function() {
  console.log("My plugin loaded!");
  
  // Add your plugin functionality here
  if (global.app) {
    global.app.myPlugin = {
      doSomething: function() {
        console.log("Plugin function executed!");
      }
    };
  }
})();
\`\`\`

Then execute the file to load your plugin!

### 7. Sharing Extensions
Save your customizations in separate \`.js\` files and share them with others!

Happy coding! 🚀`
      },
      {
        path: 'syntax-highlighter.js',
        content: `// Example Plugin: Basic Syntax Highlighter
// This demonstrates how to extend the IDE with new functionality

(function() {
  console.log("Loading syntax highlighter plugin...");
  
  if (!global.app) {
    console.log("App context not available yet");
    return;
  }
  
  // Add syntax highlighting functionality
  global.app.syntaxHighlighter = {
    highlightJavaScript: function(code) {
      // Basic JavaScript syntax highlighting
      return code
        .replace(/(function|var|let|const|if|else|for|while|return)/g, '<span style="color: #569cd6;">$1</span>')
        .replace(/(console\.log|alert)/g, '<span style="color: #4ec9b0;">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span style="color: #ce9178;">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>');
    },
    
    applyHighlighting: function() {
      const editor = global.app.ui.page.getViewById('editor-textarea');
      if (editor && global.app.editor.activeTab) {
        const content = global.app.editor.activeTab.content;
        const highlighted = this.highlightJavaScript(content);
        console.log("Applied syntax highlighting");
      }
    }
  };
  
  // Add command to editor
  if (global.app.editor) {
    global.app.editor.addCommand('highlight', (content) => {
      return global.app.syntaxHighlighter.highlightJavaScript(content);
    });
  }
  
  console.log("Syntax highlighter plugin loaded successfully!");
})();`
      }
    ];

    for (const file of initialFiles) {
      await this.createFile(file.path, file.content);
    }
  }

  async loadFileTree() {
    this._fileTree = await this.buildFileTree(this._rootPath);
    this.notifyPropertyChange('fileTree', this._fileTree);
  }

  async buildFileTree(folderPath) {
    const nodes = [];
    const folder = Folder.fromPath(folderPath);

    if (!Folder.exists(folderPath)) return nodes;

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
    const parentFolder = Folder.fromPath(parentPath);
    if (!Folder.exists(parentPath)) {
      Folder.fromPath(parentPath).createSync();
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
