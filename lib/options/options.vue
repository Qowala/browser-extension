<template lang="html">
  <main>
    <header>
      <img src="../assets/logo-white.png" alt="Qowala">
      <h2>Qowala</h2>
    </header>
    <div class="content">
      <aside>
        <h1>Tracked websites</h1>
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
            <li v-for="site in websites" v-bind:key="site" :title="site.hostname">
              <img :src="site.faviconUrl" :alt="site.name[0]" class="favicon">
              <span class="hostname">{{ site.name }}</span>
              <span class="delete-icon" v-on:click="remove(site)">×</span>
            </li>
          </transition-group>
        </ul>
      </aside>
      <main>
        <div class="card">
          <h1>How do I spend my time?</h1>
          <p class="desc">See how you spent your time on the websites you added to your Qowala list.</p>
          <chart :websites="websites"></chart>
        </div>
      </main>
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
    addWebsite: async function () {
      if (!this.error && !this.websites.some(x => x.hostname === this.hostname)) {
        this.websites.unshift(await Website.fromUrl(this.hostname, `${this.hostname}/favicon.ico`))
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
}

header {
  background: $primary;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: fixed;
  max-height: 110px;
  z-index: 1;
  top: 0px;

  h2 {
    margin: auto 20px;
    font-weight: lighter;
    color: white;
    font-family: 'Roboto', $font-stack;
  }

  img {
    max-width: 40px;
    max-height: 40px
  }
}

.content {
  margin-top: 150px;
  display: flex;

  main {
    padding: 40px;
    flex-grow: 1;
  }
}

h1, h2, h2, h3 {
  color: #4F4F4F;
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
  font-family: 'Roboto', $font-stack;
  color: $gray;
}

aside {
  padding: 20px;
}

.card {
  background: white;
  box-shadow: 0px 6px 34px rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  padding: 20px;
}

.desc {
  color: $light-green;
  font-style: italic;
}

form {
  display: flex;
}

ul {
  margin-top: 20px;

  li {
    font-family: 'Roboto', $font-stack;
    display: flex;
    align-items: center;
    transition: all .5s;
    padding: 5px;
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

.favicon {
  width: 20px;
  height: 20px;
  margin: 10px;

  // style for the alt text
  color: $primary;
  text-align: center;
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
