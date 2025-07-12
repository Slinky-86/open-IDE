const { MainViewModel } = require('./main-view-model');

let viewModel;

function navigatingTo(args) {
  const page = args.object;
  
  if (!viewModel) {
    viewModel = new MainViewModel();
    
    // Set UI reference for runtime modifications
    viewModel.setUIReference({ page: page });
  }
  
  page.bindingContext = viewModel;
}

function onRefresh(args) {
  viewModel.refreshApp();
}

function onNewFile(args) {
  viewModel.createNewFile();
}

function onFileSelect(args) {
  const file = args.object.bindingContext;
  if (file.type === 'file') {
    viewModel.editorManager.openFile(file.path);
  }
}

function onTabSelect(args) {
  const tab = args.object.bindingContext;
  viewModel.editorManager.setActiveTab(tab.id);
}

function onTabClose(args) {
  const tab = args.object.bindingContext;
  viewModel.editorManager.closeTab(tab.id);
  args.object.stopPropagation();
}

function onEditorTextChange(args) {
  const activeTab = viewModel.editorManager.activeTab;
  if (activeTab) {
    viewModel.editorManager.updateTabContent(activeTab.id, args.value);
  }
}

function onExecute(args) {
  viewModel.executeCurrentFile();
}

function onClearConsole(args) {
  viewModel.runtimeExecutor.clearHistory();
}

exports.navigatingTo = navigatingTo;
exports.onRefresh = onRefresh;
exports.onNewFile = onNewFile;
exports.onFileSelect = onFileSelect;
exports.onTabSelect = onTabSelect;
exports.onTabClose = onTabClose;
exports.onEditorTextChange = onEditorTextChange;
exports.onExecute = onExecute;
exports.onClearConsole = onClearConsole;