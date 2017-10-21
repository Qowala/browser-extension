<template lang="html">
  <main>
    <img src="../assets/logo.png" alt="Qowala">
    <div class="card">
      <h1>Settings</h1>
      <h3>Add a website to track</h3>
      <p>You can add a social network to track the time you spend on it.</p>
      <transition name="fade">
        <p v-if="error" id="error">
          Please enter a valid domain name, like <code>example.org</code>.
        </p>
      </transition>
      <form v-on:submit.prevent="addWebsite">
        <input v-model.lazy="websiteInput" type="text" id="website" autocomplete="url" />
        <button class="btn primary" type="submit">Add</button>
      </form>
      <ul id="blacklist">
        <transition-group name="fade">
          <li v-for="site in websites" v-bind:key="site">
            <span class="hostname">{{ site.name }}</span>
            <span class="delete-icon" v-on:click="remove(site)">×</span>
          </li>
        </transition-group>
      </ul>
    </div>
    <div class="card">
      <h1>Statistics</h1>
      <h3>How did you spent your time?</h3>
      <p>See how you spent your time on the websites you added to your Qowala list.</p>
      <chart :websites="websites"></chart>
    </div>
  </main>
</template>

<script>
import Chart from './chart.vue'
import Website from '../website'
import { fixUrl, cleanUrl } from '../utils'

const urlRegex = /[a-z0-9.-]+\.[a-z]+/

export default {
  data () {
    return {
      websites: [],
      websiteInput: ''
    }
  },
  computed: {
    error: function () {
      return this.websiteInput.length && !this.websiteInput.match(urlRegex)
    },
    hostname: function () {
      return new URL(fixUrl(cleanUrl(this.websiteInput))).hostname
    }
  },
  methods: {
    addWebsite: function () {
      if (!this.error && !this.websites.some(x => x.hostname === this.hostname)) {
        this.websites.unshift(Website.fromUrl(this.hostname))
        chrome.storage.local.set({ config: { websites: this.websites } })
        this.websiteInput = ''
      }
    },
    remove: function (website) {
      this.websites = this.websites.filter(x => x !== website)
      chrome.storage.local.set({ config: { websites: this.websites } })
    }
  },
  created: function () {
    chrome.storage.local.get({ config: { websites: [] } }, result => {
      this.websites = result.config.websites.map(x => new Website(x))
    })
  },
  components: {
    Chart
  }
}
</script>

<style lang="scss">
@import '../assets/fonts';
@import '../assets/ui-variables';

$bg: $white;
$primary: $green;
$text: black;
$secondary: $light-gray;

@import '../assets/common';

body {
  font-family: $font-stack;
  padding: 50px 10%;
}

img {
  display: block;
  width: 20%;
  margin: 0px auto;
}

h1 {
  text-transform: uppercase;
  font-size: 1.5em;
  font-weight: lighter;
}

h3 {
  font-weight: lighter;
}

p {
  font-family: 'Roboto';
  color: $gray;
}

form {
  display: flex;
}

ul {
  margin-top: 20px;

  li {
    font-family: 'Roboto';
    padding: 5px 0px;
    display: flex;
    align-items: center;
    transition: all .5s;
    padding: 10px;
    border-radius: 2px;

    &:hover {
      background: $light-gray;
    }

    span.hostname {
      flex-grow: 1;
    }

    span.delete-icon {
      cursor: pointer;
      padding: 5px;
    }
  }
}

#error {
  color: red;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
</style>
