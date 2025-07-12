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
  page.getViewById('file-tree').on('itemTap', async (args) => {
    const fileNode = args.object.bindingContext;
    if (fileNode.type === 'file') {
      await viewModel.editorManager.openFile(fileNode.path);
    }
  });

  // Editor Tab Events
  const tabBar = page.getViewById('tab-bar');
  if (tabBar) {
    tabBar.on('itemTap', (args) => {
      const tab = args.object.bindingContext;
      viewModel.editorManager.setActiveTab(tab.id);
    });
  }

  // Action button events
  const saveBtn = page.getViewById('save-btn');
  if (saveBtn) {
    saveBtn.on('tap', async () => {
      const activeTab = viewModel.editorManager.activeTab;
      if (activeTab) {
        await viewModel.editorManager.saveTab(activeTab.id);
      }
    });
  }

  const runBtn = page.getViewById('run-btn');
  if (runBtn) {
    runBtn.on('tap', async () => {
      await viewModel.executeCurrentFile();
    });
  }

  const consoleBtn = page.getViewById('console-btn');
  if (consoleBtn) {
    consoleBtn.on('tap', () => {
      viewModel.toggleConsole();
    });
  }

  const clearBtn = page.getViewById('clear-btn');
  if (clearBtn) {
    clearBtn.on('tap', () => {
      viewModel.runtimeExecutor.clearHistory();
    });
  }

  // Editor text change
  const editor = page.getViewById('editor-textarea');
  if (editor) {
    editor.on('textChange', (args) => {
      const activeTab = viewModel.editorManager.activeTab;
      if (activeTab) {
        viewModel.editorManager.updateTabContent(activeTab.id, args.object.text);
      }
    });
  }
}

// Event handlers for XML bindings
function onFileNodeTap(args) {
  const page = args.object.page;
  const viewModel = page.bindingContext;
  const fileNode = args.object.bindingContext;
  
  if (fileNode.type === 'file') {
    viewModel.editorManager.openFile(fileNode.path);
  }
}

function onTabTap(args) {
  const page = args.object.page;
  const viewModel = page.bindingContext;
  const tab = args.object.bindingContext;
  viewModel.editorManager.setActiveTab(tab.id);
}

function onTabClose(args) {
  const page = args.object.page;
  const viewModel = page.bindingContext;
  const tab = args.object.bindingContext;
  viewModel.editorManager.closeTab(tab.id);
  args.object.stopPropagation();
}

function onEditorTextChange(args) {
  const page = args.object.page;
  const viewModel = page.bindingContext;
  const activeTab = viewModel.editorManager.activeTab;
  if (activeTab) {
    viewModel.editorManager.updateTabContent(activeTab.id, args.object.text);
  }
}

function onSaveFile(args) {
  const page = args.object.page;
  const viewModel = page.bindingContext;
  const activeTab = viewModel.editorManager.activeTab;
  if (activeTab) {
    viewModel.editorManager.saveTab(activeTab.id);
  }
}

function onRunFile(args) {
  const page = args.object.page;
  const viewModel = page.bindingContext;
  viewModel.executeCurrentFile();
}

function onClearConsole(args) {
  const page = args.object.page;
  const viewModel = page.bindingContext;
  viewModel.runtimeExecutor.clearHistory();
}

// Export event handlers for XML binding
exports.onFileNodeTap = onFileNodeTap;
exports.onTabTap = onTabTap;
exports.onTabClose = onTabClose;
exports.onEditorTextChange = onEditorTextChange;
exports.onSaveFile = onSaveFile;
exports.onRunFile = onRunFile;
exports.onClearConsole = onClearConsole;
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
