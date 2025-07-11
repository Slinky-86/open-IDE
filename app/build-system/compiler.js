const { Observable, File, Folder, knownFolders } = require('@nativescript/core');

class NativeScriptCompiler extends Observable {
  constructor() {
    super();
    this._buildQueue = [];
    this._isBuilding = false;
    this._buildHistory = [];
    this._buildConfig = {
      minSdkVersion: 21,
      targetSdkVersion: 34,
      buildToolsVersion: "34.0.0",
      enableR8: true,
      enableProguard: true
    };
  }

  get buildQueue() {
    return this._buildQueue;
  }

  get isBuilding() {
    return this._isBuilding;
  }

  get buildHistory() {
    return this._buildHistory;
  }

  async queueBuild(buildType = 'debug', platform = 'android') {
    const buildTask = {
      id: this.generateBuildId(),
      type: buildType,
      platform: platform,
      timestamp: new Date(),
      status: 'queued'
    };

    this._buildQueue.push(buildTask);
    this.notifyPropertyChange('buildQueue', this._buildQueue);
    
    if (!this._isBuilding) {
      await this.processBuildQueue();
    }
    
    return buildTask.id;
  }

  async processBuildQueue() {
    if (this._buildQueue.length === 0 || this._isBuilding) return;
    
    this._isBuilding = true;
    this.notifyPropertyChange('isBuilding', true);
    
    while (this._buildQueue.length > 0) {
      const buildTask = this._buildQueue.shift();
      await this.executeBuild(buildTask);
    }
    
    this._isBuilding = false;
    this.notifyPropertyChange('isBuilding', false);
  }

  async executeBuild(buildTask) {
    try {
      buildTask.status = 'building';
      buildTask.startTime = new Date();
      
      console.log(`Starting ${buildTask.type} build for ${buildTask.platform}...`);
      
      // Simulate build process with actual NativeScript build steps
      await this.prepareBuildEnvironment(buildTask);
      await this.compileTypeScript(buildTask);
      await this.bundleAssets(buildTask);
      await this.generateNativeCode(buildTask);
      await this.packageApplication(buildTask);
      
      buildTask.status = 'completed';
      buildTask.endTime = new Date();
      buildTask.duration = buildTask.endTime - buildTask.startTime;
      buildTask.outputPath = this.getBuildOutputPath(buildTask);
      
      console.log(`Build completed in ${buildTask.duration}ms`);
      
    } catch (error) {
      buildTask.status = 'failed';
      buildTask.error = error.message;
      buildTask.endTime = new Date();
      console.error(`Build failed: ${error.message}`);
    }
    
    this._buildHistory.push(buildTask);
    this.notifyPropertyChange('buildHistory', this._buildHistory);
  }

  async prepareBuildEnvironment(buildTask) {
    // Create build directories
    const buildDir = knownFolders.documents().path + '/open-ide/builds/' + buildTask.id;
    const buildFolder = Folder.fromPath(buildDir);
    if (!buildFolder.exists) {
      await buildFolder.create();
    }
    
    buildTask.buildDir = buildDir;
    
    // Copy source files
    await this.copySourceFiles(buildTask);
    
    // Generate build configuration
    await this.generateBuildConfig(buildTask);
  }

  async copySourceFiles(buildTask) {
    // Simulate copying app files to build directory
    const sourceDir = knownFolders.documents().path + '/mobile-ide';
    const targetDir = buildTask.buildDir + '/app';
    
    // In a real implementation, this would recursively copy files
    console.log(`Copying source files from ${sourceDir} to ${targetDir}`);
  }

  async generateBuildConfig(buildTask) {
    const config = {
      ...this._buildConfig,
      buildType: buildTask.type,
      platform: buildTask.platform,
      timestamp: buildTask.timestamp
    };
    
    const configFile = File.fromPath(buildTask.buildDir + '/build-config.json');
    await configFile.writeText(JSON.stringify(config, null, 2));
  }

  async compileTypeScript(buildTask) {
    console.log('Compiling TypeScript/JavaScript files...');
    // Simulate TypeScript compilation
    await this.delay(1000);
  }

  async bundleAssets(buildTask) {
    console.log('Bundling assets and resources...');
    // Simulate asset bundling
    await this.delay(800);
  }

  async generateNativeCode(buildTask) {
    console.log('Generating native Android code...');
    // Simulate native code generation
    await this.delay(1500);
  }

  async packageApplication(buildTask) {
    console.log('Packaging application...');
    // Simulate APK/AAB packaging
    await this.delay(1200);
  }

  getBuildOutputPath(buildTask) {
    const extension = buildTask.type === 'release' ? '.aab' : '.apk';
    return `${buildTask.buildDir}/outputs/open-ide-${buildTask.type}${extension}`;
  }

  generateBuildId() {
    return 'build_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Advanced build configuration methods
  updateBuildConfig(newConfig) {
    this._buildConfig = { ...this._buildConfig, ...newConfig };
  }

  getBuildConfig() {
    return { ...this._buildConfig };
  }

  clearBuildHistory() {
    this._buildHistory = [];
    this.notifyPropertyChange('buildHistory', this._buildHistory);
  }

  cancelBuild(buildId) {
    const queueIndex = this._buildQueue.findIndex(task => task.id === buildId);
    if (queueIndex !== -1) {
      this._buildQueue.splice(queueIndex, 1);
      this.notifyPropertyChange('buildQueue', this._buildQueue);
      return true;
    }
    return false;
  }
}

module.exports = { NativeScriptCompiler };
