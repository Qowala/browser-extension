chrome.storage.local.get({ hostNavigationStats: {}, config: {} }, results => {
  // Return if the stats object is empty
  if (Object.keys(results.hostNavigationStats).length === 0 && results.hostNavigationStats.constructor === Object) {
    return
  }

  const dates = {
    'Today': new Date(new Date().setHours(0, 0, 0, 0)),
    'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
  }

  const sortedHostnames = Object.keys(results.hostNavigationStats[dates['Today']]).sort((a, b) => {
    return results.hostNavigationStats[dates['Today']][a] <= results.hostNavigationStats[dates['Today']][b]
  })

  if (sortedHostnames.length === 0) {
    return
  }

  const listEl = document.querySelector("ul")
  const nonMeasureDisplayEl = document.querySelector(".non-measure-display")
  const measureDisplayEl = document.querySelector(".measure-display")
  const timeSpentEl = document.querySelector(".time-spent")
  const networkEl = document.querySelector(".network")
  const dateEl = document.querySelector(".date")
  let displayDate = 'Today'
  let displayHostname = ''

  // Setup listener for dropdown
  networkEl.addEventListener('change', updateDisplayedHostname)
  dateEl.addEventListener('change', updateDisplayedDate)

  function estimateTime () {
    if (typeof results.hostNavigationStats[dates[displayDate]] == "undefined" ||
        typeof results.hostNavigationStats[dates[displayDate]][displayHostname] == "undefined") {
      timeSpentEl.textContent = 'No data'
      return
    }

    const elapsedTime = results.hostNavigationStats[dates[displayDate]][displayHostname]
    let displayTime = ''
    let displayUnit = ''

    if ((elapsedTime / 60 / 60) >= 1) {
      displayTime = Math.floor(elapsedTime / 60 / 60)
      displayUnit = "hour"
    }
    else if ((elapsedTime / 60) >= 1) {
      displayTime = Math.floor(elapsedTime / 60)
      displayUnit = "minute"
    }
    else {
      displayTime = elapsedTime
      displayUnit = "second"
    }

    // Display plural
    if (displayTime > 1) {
      displayUnit = displayUnit + 's'
    }

    timeSpentEl.textContent = `${displayTime} ${displayUnit}`
  }

  function updateDisplayedHostname (event) {
    // You can use “this” to refer to the selected element.
    if(!event.target.value) alert('Please Select One')
    else {
      displayHostname = event.target.value
      estimateTime()
    }
  }

  function updateDisplayedDate (event) {
    // You can use “this” to refer to the selected element.
    if(!event.target.value) alert('Please Select One')
    else {
      displayDate = event.target.value
      estimateTime()
    }
  }

  while(networkEl.firstChild)
    networkEl.removeChild(networkEl.firstChild)

  // Get hostname of current tab
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const currentHostname = new URL(tabs[0].url).hostname
    // Display five most visited websites
    const MAX_ITEMS = 5
    let i = 0
    for (const hostname of sortedHostnames) {
      if (i >= MAX_ITEMS) {
        break
      }

      const networkItem = document.createElement("option")

      networkItem.textContent = `${hostname}`
      networkItem.value = `${hostname}`
      // Select by default the current website
      if (sortedHostnames[i] === currentHostname) {
        networkItem.selected = 'selected'
      }
      networkEl.appendChild(networkItem)
      i++
    }
    // Display the spent time for current tab
    displayHostname = currentHostname
    // Display if website is tracked or not
    if (results.config.blacklist.indexOf(displayHostname) >= 0) {
      nonMeasureDisplayEl.style.display = "none"
      estimateTime()
      measureDisplayEl.style.display = "block"
    }
  })

  const datesList = Object.keys(dates)
  for (const date in dates) {
    const dateItem = document.createElement("option")
    dateItem.textContent = `${date}`
    dateItem.value = `${date}`
    dateEl.appendChild(dateItem)
  }
})
