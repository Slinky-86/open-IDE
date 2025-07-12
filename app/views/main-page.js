const { Page, ActionBar, ActionItem, GridLayout, StackLayout, TabView, TabViewItem, ScrollView, TextView, Label, Button, Repeater } = require('@nativescript/core');
const { MainViewModel } = require('./main-view-model.js');

let viewModel;

function createPage() {
  const page = new Page();
  
  // Create ActionBar programmatically
  const actionBar = new ActionBar();
  actionBar.title = "Open-IDE";
  actionBar.className = "action-bar";
  
  // Hot Reload button
  const refreshItem = new ActionItem();
  refreshItem.text = "⟲";
  refreshItem.ios.position = "right";
  refreshItem.android.position = "actionBar";
  refreshItem.on("tap", onRefresh);
  actionBar.actionItems.addItem(refreshItem);
  
  // New File button
  const newFileItem = new ActionItem();
  newFileItem.text = "+";
  newFileItem.ios.position = "right";
  newFileItem.android.position = "actionBar";
  newFileItem.on("tap", onNewFile);
  actionBar.actionItems.addItem(newFileItem);
  
  page.actionBar = actionBar;
  
  // Main container
  const mainGrid = new GridLayout();
  mainGrid.rows = "*, auto";
  mainGrid.className = "main-container";
  
  // Tab view for main content
  const tabView = new TabView();
  tabView.className = "tab-view";
  GridLayout.setRow(tabView, 0);
  
  // Project Explorer Tab (only visible tab)
  const explorerTab = new TabViewItem();
  explorerTab.title = "📁 Explorer";
  explorerTab.className = "tab-item";
  
  const explorerGrid = new GridLayout();
  explorerGrid.columns = "200, *";
  explorerGrid.className = "explorer-content";
  
  // Sidebar
  const sidebar = new StackLayout();
  sidebar.className = "sidebar";
  GridLayout.setColumn(sidebar, 0);
  
  const sidebarTitle = new Label();
  sidebarTitle.text = "📁 Project Files";
  sidebarTitle.className = "sidebar-title";
  sidebar.addChild(sidebarTitle);
  
  const fileTreeScroll = new ScrollView();
  fileTreeScroll.className = "file-tree";
  
  const fileTreeStack = new StackLayout();
  
  const loadingLabel = new Label();
  loadingLabel.text = "Loading files...";
  loadingLabel.className = "loading-text";
  loadingLabel.id = "loading-label";
  fileTreeStack.addChild(loadingLabel);
  
  const fileRepeater = new Repeater();
  fileRepeater.id = "file-repeater";
  fileRepeater.itemTemplate = `
    <StackLayout class="file-item" tap="onFileSelect">
      <Label text="{{ type === 'folder' ? '📁' : '📄' }} {{ name }}" class="file-name" />
    </StackLayout>
  `;
  fileTreeStack.addChild(fileRepeater);
  
  fileTreeScroll.content = fileTreeStack;
  sidebar.addChild(fileTreeScroll);
  explorerGrid.addChild(sidebar);
  
  // Editor Area
  const editorGrid = new GridLayout();
  editorGrid.rows = "auto, *";
  editorGrid.className = "editor-area";
  GridLayout.setColumn(editorGrid, 1);
  
  // Editor Tabs
  const tabsScroll = new ScrollView();
  tabsScroll.orientation = "horizontal";
  tabsScroll.className = "tabs-container";
  GridLayout.setRow(tabsScroll, 0);
  
  const tabsStack = new StackLayout();
  tabsStack.orientation = "horizontal";
  tabsStack.className = "tabs";
  
  const tabsRepeater = new Repeater();
  tabsRepeater.id = "tabs-repeater";
  tabsRepeater.itemTemplate = `
    <GridLayout columns="*, auto" class="tab {{ isActive ? 'active' : '' }}" tap="onTabSelect">
      <Label col="0" text="{{ name }}" class="tab-name" />
      <Label col="1" text="×" class="tab-close" tap="onTabClose" />
    </GridLayout>
  `;
  tabsStack.addChild(tabsRepeater);
  tabsScroll.content = tabsStack;
  editorGrid.addChild(tabsScroll);
  
  // Code Editor
  const editor = new TextView();
  editor.id = "editor-textarea";
  editor.className = "editor";
  editor.hint = "// Welcome to Open-IDE!\n// Create files and start coding...\n// Use the ⟲ button to hot reload your changes!";
  GridLayout.setRow(editor, 1);
  editor.on("textChange", onEditorTextChange);
  editorGrid.addChild(editor);
  
  explorerGrid.addChild(editorGrid);
  explorerTab.view = explorerGrid;
  tabView.items.push(explorerTab);
  
  // Hidden tabs (discoverable by uncommenting)
  /*
  // Terminal Tab - Uncomment to enable
  const terminalTab = new TabViewItem();
  terminalTab.title = "🖥️ Terminal";
  terminalTab.className = "tab-item";
  
  const terminalGrid = new GridLayout();
  terminalGrid.rows = "auto, auto, *";
  terminalGrid.className = "terminal-content";
  
  const terminalHeader = new GridLayout();
  terminalHeader.columns = "*, auto";
  terminalHeader.className = "terminal-header";
  GridLayout.setRow(terminalHeader, 0);
  
  const terminalTitle = new Label();
  terminalTitle.text = "Terminal - Command Line Interface";
  terminalTitle.className = "terminal-title";
  GridLayout.setColumn(terminalTitle, 0);
  terminalHeader.addChild(terminalTitle);
  
  const executeBtn = new Button();
  executeBtn.text = "▶️";
  executeBtn.className = "execute-btn";
  executeBtn.on("tap", onExecuteCommand);
  GridLayout.setColumn(executeBtn, 1);
  terminalHeader.addChild(executeBtn);
  
  terminalGrid.addChild(terminalHeader);
  terminalTab.view = terminalGrid;
  tabView.items.push(terminalTab);
  */
  
  mainGrid.addChild(tabView);
  
  // Console Panel
  const consoleGrid = new GridLayout();
  consoleGrid.rows = "auto, *";
  consoleGrid.className = "console-panel";
  consoleGrid.height = 120;
  GridLayout.setRow(consoleGrid, 1);
  
  const consoleHeader = new GridLayout();
  consoleHeader.columns = "*, auto, auto";
  consoleHeader.className = "console-header";
  GridLayout.setRow(consoleHeader, 0);
  
  const consoleTitle = new Label();
  consoleTitle.text = "🖥️ Console";
  consoleTitle.className = "console-title";
  GridLayout.setColumn(consoleTitle, 0);
  consoleHeader.addChild(consoleTitle);
  
  const executeButton = new Button();
  executeButton.text = "▶️";
  executeButton.className = "execute-btn";
  executeButton.on("tap", onExecute);
  GridLayout.setColumn(executeButton, 1);
  consoleHeader.addChild(executeButton);
  
  const clearButton = new Button();
  clearButton.text = "🗑️";
  clearButton.className = "clear-btn";
  clearButton.on("tap", onClearConsole);
  GridLayout.setColumn(clearButton, 2);
  consoleHeader.addChild(clearButton);
  
  consoleGrid.addChild(consoleHeader);
  
  const consoleScroll = new ScrollView();
  consoleScroll.className = "console-output";
  GridLayout.setRow(consoleScroll, 1);
  
  const consoleStack = new StackLayout();
  consoleStack.className = "console-content";
  
  const consoleWelcome = new Label();
  consoleWelcome.text = "Console ready. Execute code to see output.";
  consoleWelcome.className = "console-text";
  consoleWelcome.id = "console-welcome";
  consoleStack.addChild(consoleWelcome);
  
  const consoleRepeater = new Repeater();
  consoleRepeater.id = "console-repeater";
  consoleRepeater.itemTemplate = `
    <StackLayout class="console-entry">
      <Label text="{{ output }}" class="console-text" textWrap="true" />
      <Label text="{{ error }}" class="console-error" textWrap="true" visibility="{{ error ? 'visible' : 'collapsed' }}" />
    </StackLayout>
  `;
  consoleStack.addChild(consoleRepeater);
  
  consoleScroll.content = consoleStack;
  consoleGrid.addChild(consoleScroll);
  
  mainGrid.addChild(consoleGrid);
  page.content = mainGrid;
  
  return page;
}

function navigatingTo(args) {
  const page = args.object;
  
  try {
    if (!viewModel) {
      viewModel = new MainViewModel();
      viewModel.setUIReference({ page: page });
    }
    
    page.bindingContext = viewModel;
    
    // Bind repeaters
    const fileRepeater = page.getViewById("file-repeater");
    const tabsRepeater = page.getViewById("tabs-repeater");
    const consoleRepeater = page.getViewById("console-repeater");
    
    if (fileRepeater) fileRepeater.bind({ sourceProperty: "fileSystem.fileTree", targetProperty: "items" }, viewModel);
    if (tabsRepeater) tabsRepeater.bind({ sourceProperty: "editorManager.tabs", targetProperty: "items" }, viewModel);
    if (consoleRepeater) consoleRepeater.bind({ sourceProperty: "runtimeExecutor.history", targetProperty: "items" }, viewModel);
    
    // Update editor content when active tab changes
    updateEditorContent(page);
    
  } catch (error) {
    console.error('Error in navigatingTo:', error);
  }
}

function updateEditorContent(page) {
  const editor = page.getViewById("editor-textarea");
  const activeTab = viewModel ? viewModel.editorManager.activeTab : null;
  
  if (editor && activeTab) {
    editor.text = activeTab.content;
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
    updateEditorContent(args.object.page);
  }
}

function onTabSelect(args) {
  const tab = args.object.bindingContext;
  if (tab && viewModel) {
    viewModel.editorManager.setActiveTab(tab.id);
    updateEditorContent(args.object.page);
  }
}

function onTabClose(args) {
  const tab = args.object.bindingContext;
  if (tab && viewModel) {
    viewModel.editorManager.closeTab(tab.id);
    updateEditorContent(args.object.page);
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

// Hidden terminal function (discoverable)
/*
function onExecuteCommand(args) {
  if (viewModel && viewModel.terminalManager) {
    viewModel.terminalManager.executeCommand();
  }
}
*/

// Export the page creation function
exports.createPage = createPage;
exports.navigatingTo = navigatingTo;
exports.onFileSelect = onFileSelect;
exports.onTabSelect = onTabSelect;
exports.onTabClose = onTabClose;