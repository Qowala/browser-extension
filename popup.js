function getHostname(tabs) {
  var url = new URL(tabs[0].url);
  return url.hostname;
}

function onError(error) {
  console.log(`Error: ${error}`);
}

// Get the saved stats and render the data in the popup window.
chrome.storage.local.get("hostNavigationStats", function(results) {
  if (!results.hostNavigationStats) {
    return;
  }

  const {hostNavigationStats} = results;
  const dates = {
    'Today': new Date(new Date().setHours(0, 0, 0, 0)),
    'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate()- 1)).setHours(0, 0, 0, 0)),
  };
  const sortedHostnames = Object.keys(hostNavigationStats[dates['Today']]).sort((a, b) => {
    return hostNavigationStats[dates['Today']][a] <= hostNavigationStats[dates['Today']][b];
  });

  if (sortedHostnames.length === 0) {
    return;
  }

  let listEl = document.querySelector("ul");
  let timeSpentEl = document.querySelector(".time-spent");
  let networkEl = document.querySelector(".network");
  let dateEl = document.querySelector(".date");
  var displayDate = 'Today';
  var displayHostname = '';

  // Setup listener for dropdown
  networkEl.onchange=updateDisplayedHostname;
  dateEl.onchange=updateDisplayedDate;

  function estimateTime() {
    if (typeof hostNavigationStats[dates[displayDate]] == "undefined" ||
        typeof hostNavigationStats[dates[displayDate]][displayHostname] == "undefined") {
      timeSpentEl.textContent = `No data`;
      return;
    }

    const elapsedTime = hostNavigationStats[dates[displayDate]][displayHostname];

    if ((elapsedTime / 60 / 60) >= 1) {
      var displayTime = Math.floor(elapsedTime / 60 / 60);
      var displayUnit = "hour(s)";
    }
    else if ((elapsedTime / 60) >= 1) {
      var displayTime = Math.floor(elapsedTime / 60);
      var displayUnit = "minute(s)";
    }
    else {
      var displayTime = elapsedTime;
      var displayUnit = "second(s)";
    }

    timeSpentEl.textContent = `${displayTime} ${displayUnit}`;
  }

  function updateDisplayedHostname(event) {
    // You can use “this” to refer to the selected element.
    if(!event.target.value) alert('Please Select One');
    else {
      displayHostname = event.target.value;
      estimateTime();
    }
  }

  function updateDisplayedDate(event) {
    // You can use “this” to refer to the selected element.
    if(!event.target.value) alert('Please Select One');
    else {
      displayDate = event.target.value;
      estimateTime();
    }
  }

  while(networkEl.firstChild)
    networkEl.removeChild(networkEl.firstChild);

  // Get hostname of current tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentHostname = getHostname(tabs);

    // Display five most visited websites
    const MAX_ITEMS = 5;
    for (let i=0; i < sortedHostnames.length; i++) {
      if (i >= MAX_ITEMS) {
        break;
      }

      const networkItem = document.createElement("option");
      const hostname = sortedHostnames[i];

      networkItem.textContent = `${hostname}`;
      networkItem.value = `${hostname}`;
      // Select by default the current website
      if (sortedHostnames[i] === currentHostname) {
        networkItem.selected = 'selected';
      }
      networkEl.appendChild(networkItem);
    }
    // Display the spent time for current tab
    displayHostname = currentHostname;
    estimateTime();
  });

  const datesList = Object.keys(dates);
  for (let i=0; i < datesList.length; i++) {
    const dateItem = document.createElement("option");
    const date = datesList[i];

    dateItem.textContent = `${date}`;
    dateItem.value = `${date}`;
    dateEl.appendChild(dateItem);
  }
});
