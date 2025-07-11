const { MainViewModel } = require('./views/main-view-model');

function navigatingTo(args) {
  const page = args.object;
  const viewModel = new MainViewModel();
  
  page.bindingContext = viewModel;
  
  // Set UI reference for runtime modifications
  viewModel.setUIReference({ page });
  
  // Setup event handlers
  setupEventHandlers(page, viewModel);
}

function setupEventHandlers(page, viewModel) {
  
  // File Explorer Events
  page.on('fileNodeTap', async (args) => {
    const fileNode = args.object.bindingContext;
    if (fileNode.type === 'file') {
      await viewModel.editorManager.openFile(fileNode.path);
    }
  });

  // Editor Tab Events
  page.on('tabTap', (args) => {
    const tab = args.object.bindingContext;
    viewModel.editorManager.setActiveTab(tab.id);
  });

  page.on('tabClose', (args) => {
    const tab = args.object.bindingContext;
    viewModel.editorManager.closeTab(tab.id);
    args.object.stopPropagation();
  });

  // Editor Content Events
  page.on('editorTextChange', (args) => {
    const activeTab = viewModel.editorManager.activeTab;
    if (activeTab) {
      viewModel.editorManager.updateTabContent(activeTab.id, args.object.text);
    }
  });

  // Action Events
  page.on('saveFile', async () => {
    const activeTab = viewModel.editorManager.activeTab;
    if (activeTab) {
      await viewModel.editorManager.saveTab(activeTab.id);
    }
  });

  page.on('runFile', async () => {
    await viewModel.executeCurrentFile();
  });

  // Console Events
  page.on('clearConsole', () => {
    viewModel.runtimeExecutor.clearHistory();
  });
}

exports.navigatingTo = navigatingTo;
