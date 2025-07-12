const { MainViewModel } = require('./main-view-model.js');

let viewModel;

function navigatingTo(args) {
  const page = args.object;
  
  try {
    if (!viewModel) {
      viewModel = new MainViewModel();
      viewModel.setUIReference({ page: page });
    }
    
    page.bindingContext = viewModel;
  } catch (error) {
    console.error('Error in navigatingTo:', error);
  }
}

function onRefresh(args) {
  if (viewModel) {
    viewModel.hotReload();
  }
}

function onNewFile(args) {
  if (viewModel) {
    viewModel.createNewFile();
  }
}

function onFileSelect(args) {
  const file = args.object.bindingContext;
  if (file && file.type === 'file' && viewModel) {
    viewModel.editorManager.openFile(file.path);
  }
}

function onTabSelect(args) {
  const tab = args.object.bindingContext;
  if (tab && viewModel) {
    viewModel.editorManager.setActiveTab(tab.id);
  }
}

function onTabClose(args) {
  const tab = args.object.bindingContext;
  if (tab && viewModel) {
    viewModel.editorManager.closeTab(tab.id);
  }
  args.object.stopPropagation();
}

function onEditorTextChange(args) {
  const activeTab = viewModel ? viewModel.editorManager.activeTab : null;
  if (activeTab) {
    viewModel.editorManager.updateTabContent(activeTab.id, args.value);
  }
}

function onExecute(args) {
  if (viewModel) {
    viewModel.executeCurrentCode();
  }
}

function onClearConsole(args) {
  if (viewModel) {
    viewModel.runtimeExecutor.clearHistory();
  }
}

// Hidden advanced features (discoverable)
/*
function onSettings(args) {
  if (viewModel) {
    viewModel.openSettings();
  }
}

function onExecuteCommand(args) {
  if (viewModel) {
    viewModel.executeTerminalCommand();
  }
}
*/

exports.navigatingTo = navigatingTo;
exports.onRefresh = onRefresh;
exports.onNewFile = onNewFile;
exports.onFileSelect = onFileSelect;
exports.onTabSelect = onTabSelect;
exports.onTabClose = onTabClose;
exports.onEditorTextChange = onEditorTextChange;
exports.onExecute = onExecute;
exports.onClearConsole = onClearConsole;
// exports.onSettings = onSettings;
// exports.onExecuteCommand = onExecuteCommand;