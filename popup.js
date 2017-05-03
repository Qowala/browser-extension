function getHostname(tabs) {
  var url = new URL(tabs[0].url);
  return url.hostname;
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function getCurrentTab() {
  var querying = browser.tabs.query({active: true, currentWindow: true});
  return querying.then(getHostname, onError);
}
// Get the saved stats and render the data in the popup window.
var gettingStoredStats = browser.storage.local.get("hostNavigationStats");
gettingStoredStats.then(results => {
  if (!results.hostNavigationStats) {
    return;
  }

  const {hostNavigationStats} = results;
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const sortedHostnames = Object.keys(hostNavigationStats[today]).sort((a, b) => {
    return hostNavigationStats[a] <= hostNavigationStats[b];
  });

  if (sortedHostnames.length === 0) {
    return;
  }

  let listEl = document.querySelector("ul");
  let timeSpentEl = document.querySelector(".time-spent");
  let networkEl = document.querySelector(".network");
  let dateEl = document.querySelector(".date");

  // Setup listener for dropdown
  networkEl.onchange=updateDisplayedNetwork;

  function estimateTime(hostname) {
    const elapsedTime = hostNavigationStats[today][hostname];

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

  function updateDisplayedNetwork(event) {
    // You can use “this” to refer to the selected element.
    if(!event.target.value) alert('Please Select One');
    else estimateTime(event.target.value);
  }

  while(networkEl.firstChild)
    networkEl.removeChild(networkEl.firstChild);

  const MAX_ITEMS = 5;
  for (let i=0; i < sortedHostnames.length; i++) {
    if (i >= MAX_ITEMS) {
      break;
    }

    const networkItem = document.createElement("option");
    const hostname = sortedHostnames[i];

    networkItem.textContent = `${hostname}`;
    networkEl.appendChild(networkItem);
    dateEl.textContent = `Today`;
  }

  // Display time for current tab
  getCurrentTab().then(function(hostname) {
    estimateTime(hostname);
  });
});
