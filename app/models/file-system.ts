import { Observable, knownFolders, File, Folder } from '@nativescript/core';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isExpanded?: boolean;
}

export class FileSystemManager extends Observable {
  private _rootPath: string;
  private _fileTree: FileNode[] = [];

  constructor() {
    super();
    this._rootPath = knownFolders.documents().path + '/mobile-ide';
    this.initializeWorkspace();
  }

  get fileTree(): FileNode[] {
    return this._fileTree;
  }

  get rootPath(): string {
    return this._rootPath;
  }

  private async initializeWorkspace() {
    try {
      const workspaceFolder = Folder.fromPath(this._rootPath);
      if (!Folder.exists(this._rootPath)) {
        workspaceFolder.createSync();
        await this.createInitialFiles();
      }
      await this.loadFileTree();
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
    }
  }

  private async createInitialFiles() {
    // Create basic project structure
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

console.log("App extensions loaded!");`
      },
      {
        path: 'tutorial.md',
        content: `# Mobile IDE Runtime Modification Tutorial

## Getting Started

This IDE allows you to modify its own code at runtime! Here's how:

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
const page = app.ui.page;
const actionBar = page.actionBar;

// Add custom action item
const customAction = new ActionItem();
customAction.text = "Custom";
customAction.on("tap", () => {
  alert("Custom action triggered!");
});
actionBar.actionItems.addItem(customAction);
\`\`\`

#### Extend the editor:
\`\`\`javascript
// Add custom editor commands
app.editor.addCommand("format", (content) => {
  // Your formatting logic
  return formattedContent;
});
\`\`\`

### 5. Hot Reload
After making changes:
1. Save your files
2. Use the refresh button or restart the app
3. Your changes will be applied immediately

### 6. Sharing Extensions
Save your customizations in separate \`.js\` files and share them with others!

Happy coding! 🚀`
      }
    ];

    for (const file of initialFiles) {
      await this.createFile(file.path, file.content);
    }
  }

  async loadFileTree(): Promise<void> {
    this._fileTree = await this.buildFileTree(this._rootPath);
    this.notifyPropertyChange('fileTree', this._fileTree);
  }

  private async buildFileTree(folderPath: string): Promise<FileNode[]> {
    const nodes: FileNode[] = [];
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

  async readFile(relativePath: string): Promise<string> {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    return await file.readText();
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    await file.writeText(content);
  }

  async createFile(relativePath: string, content: string = ''): Promise<void> {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    
    // Create parent directories if needed
    const parentPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
    const parentFolder = Folder.fromPath(parentPath);
    if (!Folder.exists(parentPath)) {
      parentFolder.createSync();
    }
    
    await file.writeText(content);
    await this.loadFileTree();
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this._rootPath + '/' + relativePath;
    const file = File.fromPath(fullPath);
    if (File.exists(fullPath)) {
      await file.remove();
      await this.loadFileTree();
    }
  }
}
