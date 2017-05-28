const nonMeasureDisplayEl = document.querySelector('.non-measure-display')
const measureDisplayEl = document.querySelector('.measure-display')
const timeSpentEl = document.querySelector('.time-spent')
const networkEl = document.querySelector('.network')
const dateEl = document.querySelector('.date')
let displayDate = 'Today'
let displayHostname = ''

const dates = {
  'Today': new Date(new Date().setHours(0, 0, 0, 0)),
  'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
}

for (const date in dates) {
  const dateItem = document.createElement('option')
  dateItem.textContent = date
  dateItem.value = date
  dateEl.appendChild(dateItem)
}

chrome.storage.local.get({ hostNavigationStats: {}, config: {} }, results => {
  // Return if the stats object is empty
  if (Object.keys(results.hostNavigationStats).length === 0) {
    return
  }

  const todayStats = results.hostNavigationStats[dates['Today']]
  const sortedHostnames = Object.keys(todayStats).sort((a, b) => {
    return todayStats[a] <= todayStats[b]
  })

  if (sortedHostnames.length === 0) {
    return
  }

  // Setup listener for dropdown
  networkEl.addEventListener('change', event => {
    if (!event.target.value) {
      alert('Please Select One')
    } else {
      displayHostname = event.target.value
      estimateTime()
    }
  })

  dateEl.addEventListener('change', event => {
    if (!event.target.value) {
      alert('Please Select One')
    } else {
      displayDate = event.target.value
      estimateTime()
    }
  })

  function estimateTime () {
    if (typeof results.hostNavigationStats[dates[displayDate]] === 'undefined' ||
        typeof results.hostNavigationStats[dates[displayDate]][displayHostname] === 'undefined') {
      timeSpentEl.textContent = 'No data'
      return
    }

    const elapsedTime = results.hostNavigationStats[dates[displayDate]][displayHostname]
    updateTimer(elapsedTime)
  }

  // Get hostname of current tab
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const currentHostname = new URL(tabs[0].url).hostname

    // Display five most visited websites
    for (const hostname of sortedHostnames.slice(0, 5)) {
      const networkItem = document.createElement('option')
      networkItem.textContent = hostname
      networkItem.value = hostname
      // Select by default the current website
      if (hostname === currentHostname) {
        networkItem.selected = true
      }
      networkEl.appendChild(networkItem)
    }
    // Display the spent time for current tab
    displayHostname = currentHostname
    // Display if website is tracked or not
    if (results.config.blacklist.includes(displayHostname)) {
      nonMeasureDisplayEl.style.display = 'none'
      estimateTime()
      measureDisplayEl.style.display = 'block'
    }
  })
})

function updateTimer (elapsedTime) {
  let displayTime
  let displayUnit

  if ((elapsedTime / 60 / 60) >= 1) {
    displayTime = Math.floor(elapsedTime / 60 / 60)
    displayUnit = 'hour'
  } else if ((elapsedTime / 60) >= 1) {
    displayTime = Math.floor(elapsedTime / 60)
    displayUnit = 'minute'
  } else {
    displayTime = elapsedTime
    displayUnit = 'second'
  }

  // Display plural
  if (displayTime > 1) {
    displayUnit = displayUnit + 's'
  }

  timeSpentEl.textContent = `${displayTime} ${displayUnit}`
  return timeSpentEl.textContent
}

module.exports = {
  updateTimer: updateTimer
}
