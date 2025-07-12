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

A mobile development environment with hot reload capabilities.

### Core Features Available:

#### 🔥 Hot Reload
- Modify your code
- Hit the refresh button (⟲)
- See changes applied instantly

#### 📁 File Management
- Create files with the + button
- Edit code in the built-in editor
- Files are automatically saved

#### ▶️ Code Execution
- Write JavaScript code
- Execute with the ▶️ button
- See output in the console

#### 🔧 Runtime API
Access the Open-IDE API in your code:

\`\`\`javascript
// Check if API is available
if (global.openIDE) {
  console.log("API ready!");
  
  // Create files programmatically
  global.openIDE.createFile('test.js', 'console.log("Hello!");');
  
  // Read file contents
  const content = global.openIDE.readFile('tutorial.md');
  
  // Execute code
  global.openIDE.execute('console.log("Runtime execution!");');
}
\`\`\`

### Getting Started:

1. Create a new JavaScript file using the + button
2. Write some code
3. Execute it with ▶️
4. Modify the code and use ⟲ to hot reload

### Building Your Environment:

Use the runtime API to extend Open-IDE:
- Add custom functionality
- Create development tools
- Build your own IDE features

Start exploring and building! 🚀

---

*Tip: Look through the codebase for commented features you can discover and enable...*
`;

    await this.createFile('tutorial.md', tutorialContent);
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