const { MainViewModel } = require('./main-view-model');

let viewModel;

function navigatingTo(args) {
  const page = args.object;
  console.log('Page navigating to...');
  
  try {
    if (!viewModel) {
      console.log('Creating view model...');
      viewModel = new MainViewModel();
      
      // Set UI reference for runtime modifications
      viewModel.setUIReference({ page: page });
    }
    
    page.bindingContext = viewModel;
    console.log('Page loaded successfully');
  } catch (error) {
    console.error('Error in navigatingTo:', error);
  }
}

function onRefresh(args) {
  console.log('Refresh tapped');
  if (viewModel) {
    viewModel.refreshApp();
  }
}

function onNewFile(args) {
  console.log('New file tapped');
  if (viewModel) {
    viewModel.createNewFile();
  }
}

function onFileSelect(args) {
  const file = args.object.bindingContext;
  console.log('File selected:', file);
  if (file && file.type === 'file' && viewModel) {
    viewModel.editorManager.openFile(file.path);
  }
}

function onTabSelect(args) {
  const tab = args.object.bindingContext;
  console.log('Tab selected:', tab);
  if (tab && viewModel) {
    viewModel.editorManager.setActiveTab(tab.id);
  }
}

function onTabClose(args) {
  const tab = args.object.bindingContext;
  console.log('Tab close:', tab);
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
  console.log('Execute tapped');
  if (viewModel) {
    viewModel.executeCurrentFile();
  }
}

function onClearConsole(args) {
  console.log('Clear console tapped');
  if (viewModel) {
    viewModel.runtimeExecutor.clearHistory();
  }
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