function showUrls(tabs) {
  let urlsObject = {};
  for (let tab of tabs) {
    // tab.url requires the `tabs` permission
    //console.log(tab.url);
    var url = new URL(tab.url);
    urlsObject[url.hostname] = true;
  }
  return urlsObject;
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function getTabs() {
  var querying = browser.tabs.query({});
  return querying.then(showUrls, onError);
}

// Load existent stats with the storage API.
var gettingStoredStats = browser.storage.local.get("hostNavigationStats");
gettingStoredStats.then(results => {
  // Initialize the saved stats if not yet initialized.
  if (!results.hostNavigationStats) {
    results = {
      hostNavigationStats: {}
    };
  }

  const {hostNavigationStats} = results;

  var intervalID = window.setInterval(measureTime, 1000);

  function measureTime() {
    getTabs().then(function(urlsObject) {

      console.log('urlsObject: ', urlsObject);
      urlsArray = Object.keys(urlsObject);
      console.log('urlsArray: ', urlsArray);
      for (var i = 0; i < urlsArray.length; i++) {

        hostNavigationStats[urlsArray[i]] = hostNavigationStats[urlsArray[i]] || 0;
        hostNavigationStats[urlsArray[i]]++;
      }

      // Persist the updated stats.
      browser.storage.local.set(results);
    });
  }
});
