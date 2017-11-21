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
            <option v-for="site in topSites" :value="site.hostname">{{ site.name }}</option>
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
      <div v-if="trackable">
        <p>
          It looks like this website ({{ hostname }}) is not on your list.
          <br>
          If it should, you can add it now.
        </p>
        <button v-on:click="track" class="btn primary big">Start tracking</button>
      </div>
      <div v-else>
        <p>Start browsing to see how you spend your time!</p>
      </div>
    </div>
  </main>
</template>

<script>
import { today, yesterday, fixUrl, cleanUrl, formatTime } from '../utils'
import Website from '../website'

const TODAY = today()
const YESTERDAY = yesterday()

export default {
  data () {
    return {
      dates: {
        'Today': TODAY,
        'Yesterday': YESTERDAY
      },
      date: 'Today',
      config: {
        websites: []
      },
      hostname: '',
      _activeURL: '',
      faviconUrl: ''
    }
  },
  computed: {
    activeURL: {
      cache: false,
      get: function () {
        return this._activeURL || ''
      },
      set: function (url) {
        this._activeURL = url
        this.hostname = new URL(fixUrl(cleanUrl(url))).hostname
      }
    },
    tracked: function () {
      return this.currentWebsite !== null && this.currentWebsite !== undefined
    },
    trackable: function () {
      return !(this.activeURL.startsWith('https://about:') || this.activeURL.startsWith('https://chrome://')) // don't track browser pages
    },
    topSites: function () {
      const date = this.dates[this.date]
      // We take the five most visited websites, ordered by the time spent on them
      const res = this.config.websites.sort((a, b) => a.navigationStats[date] <= b.navigationStats[date]).slice(0, 5)

      if (!res.some(x => x.matchUrl(this.activeURL))) { // if the current website is not present, still display it in the list
        res.unshift(this.config.websites.find(w => w.matchUrl(this.activeURL)))
        res.splice(5, 1) // remove another website from the list
      }
      return res.filter(x => x !== null && x !== undefined).filter(x => x.navigationStats[date] > 0)
    },
    timeSpent: function () {
      if (this.dates[this.date]) {
        const ws = this.currentWebsite

        if (ws && ws.navigationStats[this.dates[this.date]]) {
          return formatTime(ws.navigationStats[this.dates[this.date]])
        } else {
          return `You didn't visited this site ${this.date.toLowerCase()}`
        }
      } else {
        return 'Invalid date'
      }
    },
    validDates: function () {
      return Object.keys(this.dates).filter(date => {
        if (this.currentWebsite.navigationStats[this.dates[date]] !== undefined) {
          return date
        } else {
          return null
        }
      })
    },
    percentage: function () {
      const ws = this.currentWebsite
      const total = this.config.websites.reduce((s, w) =>
        s + (w.navigationStats[this.dates[this.date]] ? w.navigationStats[this.dates[this.date]] : 0),
      1)
      const currentTime = ws.navigationStats[this.dates[this.date]] + 1

      return Math.round((currentTime / total) * 100)
    },
    currentWebsite: function () {
      return this.config.websites.find(x => x.hostname === this.hostname)
    }
  },
  methods: {
    track: async function () {
      const ws = await Website.fromUrl(this.activeURL, this.faviconUrl)
      ws.isActive() // fake tracking to be sure we display at least "One second spent"
      this.config.websites.push(ws)
      chrome.storage.local.set({ config: this.config })
    }
  },
  created: function () {
    chrome.storage.local.get({ config: { websites: [] } }, res => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        this.config.websites = res.config.websites.map(x => new Website(x))
        this.activeURL = tabs[0].url
        this.faviconUrl = tabs[0].favIconUrl
      })
    })
  }
}
</script>

<style lang="scss">
@import '../assets/fonts';
@import '../assets/ui-variables';

$bg: $green;
$primary: $white;
$text: $white;
$secondary: $light-green;

@import '../assets/common';

body {
  min-width: 240px;
  max-width: 320px;
  font-size: 100%;
  color: $secondary;
  padding: 10px 20px 20px;
}

p {
  margin: 0px;
}

header {
  hr {
    border: 1px solid $light-green;
    margin: 15px auto 0;
  }

  img {
    width: 25px;
    display: block;
    margin: 10px auto;
  }
}

.time-spent {
  color: $white;
  font-size: 36px;
  text-transform: uppercase;
  padding: 0px;
}

.parameters {
  display: flex;
}
.dropdown {
  font-family: $font-stack;
  border: 0 !important;  /* removes border */
  -webkit-appearance: none;  /* removes default Chrome & Safari style */
  -moz-appearance: none;  /* removes default Firefox style */
  appearance: none;
  background-color: $green;
  color: $white;
  cursor: pointer;
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

.progress-bar, .progress {
  height: 5px;
  border-radius: 5px;
}
.progress-bar {
  margin: 10px 0px;
  background: $light-green;
}
.progress {
   background: $white;
}
</style>
