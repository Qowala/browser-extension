<template lang="html">
  <main>
    <header>
      <img src="../assets/logo-white.png" alt="Qowala">
      <hr>
    </header>
    <div v-if="tracked">
      <div class="section">
        <p>
          You've spent…
        </p>
        <div class="time-spent">
          {{ timeSpent }}
        </div>
        <div class="parameters">
          On
          <select v-model="hostname" class="dropdown network">
            <option v-for="site in topSites" :value="site">{{ site }}</option>
          </select>
          <select v-model="date" class="dropdown date">
            <option v-for="day in validDates" :value="day">{{ day }}</option>
          </select>
        </div>
      </div>
      <div class="section">
        <p>That represents…</p>
        <div class="progress-bar">
          <div class="progress" v-bind:style="{ width: `${percentage}%` }"></div>
        </div>
        <p>
          <span class="text primary">{{ percentage }}%</span> of your total
          time spent on social networks <span class="text primary">{{ date.toLowerCase() }}</span>
        </p>
      </div>
    </div>
    <div class="section" v-else>
      <p>
        It looks like this website is not on your list.
        <br>
        If it should, you can add it now.
      </p>
      <button v-on:click="track" class="btn primary">Start tracking</button>
    </div>
  </main>
</template>

<script>
export default {
  data () {
    return {
      dates: {
        'Today': new Date(new Date().setHours(0, 0, 0, 0)),
        'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
      },
      date: 'Today',
      config: {},
      stats: {},
      activeURL: ''
    }
  },
  computed: {
    hostname: {
      get: function () {
        return this.activeURL
      },
      set: function (hostname) {
        // Convert www.example.com domain to simple domain example.com
        if (hostname.startsWith('www.') && (hostname.match(/\./g) || []).length === 2) {
          hostname = hostname.substring(4)
        }
        this.activeURL = hostname
      }
    },
    tracked: function () {
      return this.config && this.config.blacklist &&
             this.config.blacklist.includes(this.activeURL)
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
}
</script>

<style lang="css">
@font-face {
  font-family: 'Roboto Bold';
  src: url('../assets/roboto-bold.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}
body {
  min-width: 240px;
  max-width: 320px;
  font-family: "Roboto Bold", "Segoe UI", "Lucida Grande", Tahoma, sans-serif;
  font-size: 100%;
  color: #6FCF97;
  background-color: #21A868;
  border: none;
  padding: 10px 20px 20px;
}
header hr {
  border: 1px solid #6FCF97;
  margin: 15px auto 0;
}
header img {
  width: 25px;
  display: block;
  margin: 10px auto;
}

p {
  margin: 0px;
}
.section {
  margin: 30px auto;
}
.text.primary {
  color: white;
}
.time-spent {
  color: #FFF;
  font-size: 36px;
  text-transform: uppercase;
  padding: 0px;
}

.parameters {
  display: flex;
}
.dropdown {
  font-family: "Roboto Bold", "Segoe UI", "Lucida Grande", Tahoma, sans-serif;
  border: 0 !important;  /* removes border */
  -webkit-appearance: none;  /* removes default Chrome & Safari style */
  -moz-appearance: none;  /* removes default Firefox style */
  appearance: none;
  background-color: #21A868;
  cursor: pointer;
  color: #FFF;
  display: inline;
  font-size: 100%;
  margin: 0px 5px;
  flex: 1;

  background: url('../assets/arrow-down.png');
  background-size: 13px;
  background-repeat: no-repeat;
  background-position: right center;
  padding-right: 17px;
}
.btn {
  font-family: "Roboto Bold", "Segoe UI", "Lucida Grande", Tahoma, sans-serif;
  text-transform: uppercase;
  padding: 15px 30px;
  box-shadow: 0px 5px 40px rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 2px;
  margin: 20px auto;
  cursor: pointer;
  display: block;
}
.btn.primary {
  background: white;
  color: #21A868;
}

.progress-bar, .progress {
  height: 5px;
  border-radius: 5px;
}
.progress-bar {
  margin: 10px 0px;
  background: #6FCF97;
}
.progress {
   background: white;
}
</style>
