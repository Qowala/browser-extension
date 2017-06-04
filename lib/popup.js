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
    activeURL: ''
  },
  computed: {
    tracked: function () {
      return this.config && this.config.blacklist && this.config.blacklist.includes(this.activeURL)
    },
    topSites: function () {
      const dayStats = this.stats[this.dates[this.date]]
      // We take the five most visited websites, ordered by the time spent on them
      const res = dayStats ? Object.keys(dayStats).sort((a, b) => dayStats[a] <= dayStats[b]).slice(0, 5) : []
      if (!res.includes(this.hostname)) {
        res.unshift(this.hostname)
      }
      return res
    },
    timeSpent: function () {
      if (this.dates[this.date]) {
        if (this.stats[this.dates[this.date]]) {
          if (this.stats[this.dates[this.date]][this.hostname]) {
            return this.formatTime(this.stats[this.dates[this.date]][this.hostname])
          } else {
            return `You didn't visited this site ${this.date.toLowerCase()}!`
          }
        } else {
          return 'No data for this day'
        }
      } else {
        return 'Invalid date'
      }
    },
    validDates: function () {
      return Object.keys(this.dates).filter(date => this.stats && this.stats[this.dates[date]])
    },
    percentage: function () {
      let total = 0
      let currentTime = 0
      const dayStats = this.stats[this.dates[this.date]]
      for (const site in dayStats) {
        total += dayStats[site]
        if (site === this.hostname) {
          currentTime = dayStats[site]
        }
      }

      return Math.round((currentTime / total) * 100)
    }
  },
  methods: {
    track: function () {
      this.config.blacklist.push(this.hostname)
      this.stats[this.dates.Today][this.hostname] = 1 // "Fake" time to be sure that it will show something after re-rendering
      chrome.storage.local.set({ hostNavigationStats: this.stats, config: this.config })
    },
    formatTime: function (time) {
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
  },
  created: function () {
    chrome.storage.local.get({ hostNavigationStats: {}, config: {} }, res => {
      this.stats = res.hostNavigationStats
      this.config = res.config
    })

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      this.hostname = this.activeURL = new URL(tabs[0].url).hostname
    })
  }
})

if (module) {
  module.exports = app
}
