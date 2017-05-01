function getTabs() {
  browser.tabs.query({}, logTabs);
}

function logTabs(tabs) {
  console.log(tabs);
}

getTabs();
