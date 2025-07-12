const { Observable, knownFolders, File, Folder } = require('@nativescript/core');

class FileSystemManager extends Observable {
  constructor() {
    super();
    this._rootPath = knownFolders.documents().path + '/open-ide-workspace';
    this._fileTree = [];
    this._isLoading = true;
    
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
      this.set('isLoading', true);
      
      if (!Folder.exists(this._rootPath)) {
        await this.ensureDirectoryExists(this._rootPath);
        await this.createTutorialFile();
      }
      await this.loadFileTree();
      
      this.set('isLoading', false);
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
      // Directory creation handled by NativeScript
    }
  }

  async createTutorialFile() {
    const tutorialContent = `# Open-IDE Tutorial 📱

## Welcome to Open-IDE!

A **pure JavaScript** mobile development environment with **full hot reload** capabilities.

### 🔥 Hot Reload Feature

The core feature that makes Open-IDE powerful:

1. **Modify any JavaScript file** in the editor
2. **Hit the refresh button (⟲)** in the top bar
3. **See changes applied instantly** - no app restart needed!

### 📁 File Management

- **Create files** with the + button
- **Edit code** in the built-in editor with syntax highlighting
- **Files auto-save** when you switch tabs or hot reload

### ▶️ Code Execution

- **Write JavaScript code** in any file
- **Execute with ▶️** button to see output in console
- **Access runtime API** for advanced functionality

### 🔧 Runtime API

Access the Open-IDE API in your code for live modifications:

\`\`\`javascript
// Check if API is available
if (global.openIDE) {
  console.log("Open-IDE API ready!");
  
  // File operations
  global.openIDE.createFile('my-script.js', 'console.log("Hello!");');
  const content = global.openIDE.readFile('tutorial.md');
  global.openIDE.writeFile('config.js', 'module.exports = { theme: "dark" };');
  
  // Hot reload trigger
  global.openIDE.hotReload();
  
  // Execute code dynamically
  global.openIDE.execute('console.log("Runtime execution!");');
}
\`\`\`

### 🚀 Building Your Development Environment

Use the runtime API to extend Open-IDE:

1. **Create extension files** that modify the IDE behavior
2. **Use hot reload** to apply changes instantly
3. **Build custom tools** and development utilities
4. **Extend the editor** with your own features

### 💡 Getting Started

1. Create a new JavaScript file using the + button
2. Write some code that uses the \`global.openIDE\` API
3. Execute it with ▶️ to see it work
4. Modify the code and use ⟲ to hot reload changes
5. Explore the codebase to discover hidden features...

### 🔍 Discovery Mode

Open-IDE contains hidden advanced features throughout the codebase. Look for:
- Commented out code sections
- Hidden imports and modules  
- Advanced API methods
- Additional UI components

**Start exploring and building your perfect mobile IDE!** 🚀

---

*Everything in Open-IDE is hot-reloadable JavaScript - modify the IDE while using it!*
`;

    await this.createFile('tutorial.md', tutorialContent);
  }

  async loadFileTree() {
    this._fileTree = await this.buildFileTree(this._rootPath);
    this.set('fileTree', this._fileTree);
    this.notifyPropertyChange('fileTree', this._fileTree);
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