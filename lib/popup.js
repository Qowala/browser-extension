const nonMeasureDisplayEl = document.querySelector('.non-measure-display')
const measureDisplayEl = document.querySelector('.measure-display')
const timeSpentEl = document.querySelector('.time-spent')
const networkEl = document.querySelector('.network')
const dateEl = document.querySelector('.date')
const trackButton = document.getElementById('trackButton')

const dates = {
  'Today': new Date(new Date().setHours(0, 0, 0, 0)),
  'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
}

chrome.storage.local.get({ hostNavigationStats: {}, config: {} }, res => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    view(new URL(tabs[0].url).hostname, 'Today', res.config, res.hostNavigationStats)
  })
})

function view (hostname, date, config, stats) {
  const dayStats = stats[dates[date]]
  // We take the five most visited websites, ordered by the time spent on them
  const sortedHostnames = Object.keys(dayStats).sort((a, b) => dayStats[a] <= dayStats[b]).slice(0, 5)
  const timeSpent = formatTime(getTimeSpent(stats, date, hostname))

  if (config.blacklist.includes(hostname)) { // this website is tracked
    while (networkEl.firstChild) {
      networkEl.remove(networkEl.firstChild)
    }
    for (const site of sortedHostnames) {
      const networkItem = document.createElement('option')
      networkItem.textContent = site
      networkItem.value = site

      if (site === hostname) {
        networkItem.selected = true
      }

      networkEl.appendChild(networkItem)
    }

    while (dateEl.firstChild) {
      dateEl.remove(dateEl.firstChild)
    }
    for (const possibleDate in dates) {
      if (stats[dates[possibleDate]]) {
        const dateItem = document.createElement('option')
        dateItem.textContent = possibleDate
        dateItem.value = possibleDate
        dateEl.appendChild(dateItem)
      }
    }

    nonMeasureDisplayEl.style.display = 'none'
    measureDisplayEl.style.display = 'block'

    timeSpentEl.textContent = timeSpent

    networkEl.addEventListener('change', event => view(event.target.value, date, config, stats))
    dateEl.addEventListener('change', event => view(hostname, event.target.value, config, stats))
  } else {
    trackButton.addEventListener('click', evt => {
      config.blacklist.push(hostname)
      stats[dates[date]][hostname] = 1 // "Fake" time to be sure that it will show something after re-rendering
      chrome.storage.local.set({ hostNavigationStats: stats, config }, () => {
        view(hostname, date, config, stats)
      })
    })
  }
}

const getTimeSpent = (stats, date, site) =>
  !dates[date] || !stats[dates[date]]
    ? null
    : stats[dates[date]][site]

function formatTime (time) {
  if (!time) {
    return 'No data… yet!'
  }
  let displayTime
  let displayUnit

  if (time >= 3600) {
    displayTime = Math.floor(time / 3600)
    displayUnit = 'hour'
  } else if (time >= 60) {
    displayTime = Math.floor(time / 60)
    displayUnit = 'minute'
  } else {
    displayTime = time
    displayUnit = 'second'
  }

  // Display plural
  if (displayTime > 1) {
    displayUnit = displayUnit + 's'
  }

  return `${displayTime} ${displayUnit}`
}

module.exports = {
  formatTime: formatTime
}
