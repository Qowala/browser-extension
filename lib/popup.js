const app = new Vue({
  el: '#app',
  data: {
    dates: {
      'Today': new Date(new Date().setHours(0, 0, 0, 0)),
      'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
    },
    date: 'Today',
    config: {},
    stats: {},
    hostname: '',
    activeURL: '',
    noData: false
  },
  computed: {
    tracked: function () {
      return this.config && this.config.blacklist && this.config.blacklist.includes(this.activeURL)
    },
    topSites: function () {
      const dayStats = this.stats[this.dates[this.date]]
      // We take the five most visited websites, ordered by the time spent on them
      return dayStats ? Object.keys(dayStats).sort((a, b) => dayStats[a] <= dayStats[b]).slice(0, 5) : []
    },
    timeSpent: function () {
      if (this.dates[this.date]) {
        if (this.stats[this.dates[this.date]]) {
          if (this.stats[this.dates[this.date]][this.hostname]) {
            this.noData = false
            return formatTime(this.stats[this.dates[this.date]][this.hostname])
          } else {
            this.noData = true
            return `You didn't visited this site ${this.date.toLowerCase()}!`
          }
        } else {
          this.noData = false
          return 'No data for this day'
        }
      } else {
        this.noData = false
        return 'Invalid date'
      }
    },
    validDates: function () {
      return Object.keys(this.dates).filter(date => this.stats && this.stats[this.dates[date]])
    }
  },
  methods: {
    track: function () {
      this.config.blacklist.push(this.hostname)
      this.stats[this.dates.Today][this.hostname] = 1 // "Fake" time to be sure that it will show something after re-rendering
      chrome.storage.local.set({ hostNavigationStats: this.stats, config: this.config })
    }
  }
})

chrome.storage.local.get({ hostNavigationStats: {}, config: {} }, res => {
  res.hostNavigationStats[app.dates.Yesterday] = {
    'twitter.com': 52,
    'unixcorn.xyz': 42
  }
  app.stats = res.hostNavigationStats
  app.config = res.config
})

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  app.hostname = app.activeURL = new URL(tabs[0].url).hostname
})

function formatTime (time) {
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

(module || {}).exports = {
  formatTime: formatTime
}
