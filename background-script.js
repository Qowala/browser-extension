function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'configuration.json', true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }

function showUrls(tabs) {
  let urlsObject = {};
  for (let tab of tabs) {
    // tab.url requires the `tabs` permission
    //console.log(tab.url);
    var url = new URL(tab.url);
    if (url.hostname !== "") {
      urlsObject[url.hostname] = true;
    }
  }
  return urlsObject;
}

function onError(error) {
  console.log(`Error: ${error}`);
}

// Load existent stats with the storage API.
chrome.storage.local.get("hostNavigationStats", function(results) {
  // Initialize the saved stats if not yet initialized.
  if (!results.hostNavigationStats) {
    results = {
      hostNavigationStats: {}
    };
  }

  loadJSON(function(response) {
    // Parse JSON string into object
      var actual_JSON = JSON.parse(response);
      const monitoringList = actual_JSON.blacklist;

      const {hostNavigationStats} = results;

      var intervalID = window.setInterval(measureTime, 1000);

      function measureTime() {
        chrome.tabs.query({active: true}, function(tabs) {
          const urlsObject = showUrls(tabs);

          urlsArray = Object.keys(urlsObject);
          for (var i = 0; i < urlsArray.length; i++) {
            if (monitoringList.indexOf(urlsArray[i]) === -1) {
              continue;
            }

            const today = new Date(new Date().setHours(0, 0, 0, 0));
            if (!hostNavigationStats[today]) {
              hostNavigationStats[today] = {};
            }

            hostNavigationStats[today][urlsArray[i]] = hostNavigationStats[today][urlsArray[i]] || 0;
            hostNavigationStats[today][urlsArray[i]]++;
          }

          // Persist the updated stats.
          chrome.storage.local.set(results);
        });
      }
   });
});
