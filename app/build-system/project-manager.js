const { Observable, File, Folder, knownFolders } = require('@nativescript/core');

class ProjectManager extends Observable {
  constructor() {
    super();
    this._projects = [];
    this._activeProject = null;
    this._projectTemplates = new Map();
    this.initializeTemplates();
  }

  get projects() {
    return this._projects;
  }

  get activeProject() {
    return this._activeProject;
  }

  initializeTemplates() {
    this._projectTemplates.set('blank', {
      name: 'Blank App',
      description: 'A minimal NativeScript application',
      files: {
        'app/main-page.xml': this.getBlankPageTemplate(),
        'app/main-page.js': this.getBlankPageScript(),
        'app/app.js': this.getBlankAppScript(),
        'app/app.css': this.getBlankAppStyles()
      }
    });

    this._projectTemplates.set('tabs', {
      name: 'Tab Navigation',
      description: 'App with bottom tab navigation',
      files: {
        'app/main-page.xml': this.getTabsTemplate(),
        'app/main-page.js': this.getTabsScript(),
        'app/app.js': this.getBlankAppScript(),
        'app/app.css': this.getTabsStyles()
      }
    });

    this._projectTemplates.set('drawer', {
      name: 'Side Drawer',
      description: 'App with side drawer navigation',
      files: {
        'app/main-page.xml': this.getDrawerTemplate(),
        'app/main-page.js': this.getDrawerScript(),
        'app/app.js': this.getBlankAppScript(),
        'app/app.css': this.getDrawerStyles()
      }
    });
  }

  async createProject(name, template = 'blank', description = '') {
    const projectId = this.generateProjectId();
    const projectPath = knownFolders.documents().path + '/open-ide/projects/' + projectId;
    
    const project = {
      id: projectId,
      name: name,
      description: description,
      template: template,
      path: projectPath,
      createdAt: new Date(),
      lastModified: new Date(),
      buildCount: 0,
      status: 'active'
    };

    try {
      // Create project directory
      const projectFolder = Folder.fromPath(projectPath);
      if (!Folder.exists(projectPath)) {
        projectFolder.createSync();
      }

      // Generate project files from template
      await this.generateProjectFromTemplate(project, template);
      
      // Create project configuration
      await this.createProjectConfig(project);

      this._projects.push(project);
      this.notifyPropertyChange('projects', this._projects);
      
      console.log(`Project '${name}' created successfully`);
      return project;
      
    } catch (error) {
      console.error(`Failed to create project: ${error.message}`);
      throw error;
    }
  }

  async generateProjectFromTemplate(project, templateName) {
    const template = this._projectTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = project.path + '/' + filePath;
      const file = File.fromPath(fullPath);
      
      // Create parent directories if needed
      const parentPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
      const parentFolder = Folder.fromPath(parentPath);
      if (!Folder.exists(parentPath)) {
        parentFolder.createSync();
      }
      
      await file.writeText(content);
    }
  }

  async createProjectConfig(project) {
    const config = {
      name: project.name,
      id: project.id,
      version: '1.0.0',
      description: project.description,
      main: 'app/app.js',
      dependencies: {
        '@nativescript/core': '~8.8.0'
      },
      buildSettings: {
        android: {
          minSdkVersion: 21,
          targetSdkVersion: 34
        }
      },
      createdWith: 'Open-IDE',
      createdAt: project.createdAt
    };

    const configFile = File.fromPath(project.path + '/project.json');
    await configFile.writeText(JSON.stringify(config, null, 2));
  }

  async loadProjects() {
    try {
      const projectsDir = knownFolders.documents().path + '/open-ide/projects';
      const projectsFolder = Folder.fromPath(projectsDir);
      
      if (!Folder.exists(projectsDir)) {
        Folder.fromPath(projectsDir).createSync();
        return;
      }

      const entities = await projectsFolder.getEntities();
      this._projects = [];

      for (const entity of entities) {
        if (entity instanceof Folder) {
          try {
            const configFile = File.fromPath(entity.path + '/project.json');
            if (File.exists(entity.path + '/project.json')) {
              const configContent = await configFile.readText();
              const config = JSON.parse(configContent);
              
              const project = {
                id: config.id,
                name: config.name,
                description: config.description || '',
                path: entity.path,
                createdAt: new Date(config.createdAt),
                lastModified: new Date(),
                buildCount: config.buildCount || 0,
                status: 'active'
              };
              
              this._projects.push(project);
            }
          } catch (error) {
            console.error(`Failed to load project from ${entity.path}:`, error);
          }
        }
      }

      this.notifyPropertyChange('projects', this._projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  setActiveProject(projectId) {
    const project = this._projects.find(p => p.id === projectId);
    if (project) {
      this._activeProject = project;
      this.notifyPropertyChange('activeProject', project);
      return true;
    }
    return false;
  }

  async deleteProject(projectId) {
    const projectIndex = this._projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;

    const project = this._projects[projectIndex];
    
    try {
      const projectFolder = Folder.fromPath(project.path);
      if (Folder.exists(project.path)) {
        await projectFolder.remove();
      }
      
      this._projects.splice(projectIndex, 1);
      
      if (this._activeProject && this._activeProject.id === projectId) {
        this._activeProject = null;
        this.notifyPropertyChange('activeProject', null);
      }
      
      this.notifyPropertyChange('projects', this._projects);
      return true;
      
    } catch (error) {
      console.error(`Failed to delete project: ${error.message}`);
      return false;
    }
  }

  generateProjectId() {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getAvailableTemplates() {
    return Array.from(this._projectTemplates.entries()).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description
    }));
  }

  // Template content methods
  getBlankPageTemplate() {
    return `<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatingTo="navigatingTo" class="page">
  <ActionBar title="My App" class="action-bar" />
  <GridLayout class="page">
    <Label text="Hello, NativeScript!" class="h1 text-center" />
  </GridLayout>
</Page>`;
  }

  getBlankPageScript() {
    return `function navigatingTo(args) {
  const page = args.object;
  console.log("Page loaded!");
}

exports.navigatingTo = navigatingTo;`;
  }

  getBlankAppScript() {
    return `const { Application } = require('@nativescript/core');
Application.run({ moduleName: 'main-page' });`;
  }

  getBlankAppStyles() {
    return `.page {
  background-color: #ffffff;
}

.action-bar {
  background-color: #3f51b5;
  color: white;
}

.h1 {
  font-size: 24;
  font-weight: bold;
  color: #333333;
}

.text-center {
  text-align: center;
}`;
  }

  getTabsTemplate() {
    return `<TabView xmlns="http://schemas.nativescript.org/tns.xsd">
  <TabViewItem title="Home">
    <GridLayout>
      <Label text="Home Tab" class="h1 text-center" />
    </GridLayout>
  </TabViewItem>
  <TabViewItem title="Settings">
    <GridLayout>
      <Label text="Settings Tab" class="h1 text-center" />
    </GridLayout>
  </TabViewItem>
</TabView>`;
  }

  getTabsScript() {
    return `// Tab navigation script
console.log("Tabs app loaded!");`;
  }

  getTabsStyles() {
    return `${this.getBlankAppStyles()}

TabView {
  background-color: #ffffff;
}

TabViewItem {
  background-color: #ffffff;
}`;
  }

  getDrawerTemplate() {
    return `<RadSideDrawer xmlns="http://schemas.nativescript.org/tns.xsd">
  <RadSideDrawer.drawerContent>
    <StackLayout class="drawer-content">
      <Label text="Menu" class="drawer-title" />
      <Button text="Home" class="drawer-item" />
      <Button text="Settings" class="drawer-item" />
    </StackLayout>
  </RadSideDrawer.drawerContent>
  
  <RadSideDrawer.mainContent>
    <GridLayout>
      <Label text="Main Content" class="h1 text-center" />
    </GridLayout>
  </RadSideDrawer.mainContent>
</RadSideDrawer>`;
  }

  getDrawerScript() {
    return `// Side drawer script
console.log("Drawer app loaded!");`;
  }

  getDrawerStyles() {
    return `${this.getBlankAppStyles()}

.drawer-content {
  background-color: #f0f0f0;
  padding: 20;
}

.drawer-title {
  font-size: 18;
  font-weight: bold;
  margin-bottom: 20;
}

.drawer-item {
  margin-bottom: 10;
  text-align: left;
}`;
  }

  async prepareBuildEnvironment(buildTask) {
    // Create build directories
    const buildDir = knownFolders.documents().path + '/open-ide/builds/' + buildTask.id;
    const buildFolder = Folder.fromPath(buildDir);
    if (!Folder.exists(buildDir)) {
      Folder.fromPath(buildDir).createSync();
    }
    
    buildTask.buildDir = buildDir;
  }
}

module.exports = { ProjectManager };