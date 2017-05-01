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
  while(listEl.firstChild)
    listEl.removeChild(listEl.firstChild);

  const MAX_ITEMS = 5;
  for (let i=0; i < sortedHostnames.length; i++) {
    if (i >= MAX_ITEMS) {
      break;
    }

    const listItem = document.createElement("li");
    const hostname = sortedHostnames[i];

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

    listItem.textContent = `${hostname}: ${displayTime} ${displayUnit}`;
    listEl.appendChild(listItem);
  }
});
