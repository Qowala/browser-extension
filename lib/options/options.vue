<template lang="html">
  <main>
    <img src="../assets/logo.png" alt="Qowala">
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
      <button type="submit">Add</button>
    </form>
    <ul id="blacklist">
      <transition-group name="fade">
        <li v-for="site in blacklist" v-bind:key="site">
          <span class="hostname">{{ site }}</span>
          <span class="delete-icon" v-on:click="remove(site)">×</span>
        </li>
      </transition-group>
    </ul>
  </main>
</template>

<script>
const urlRegex = /[a-z0-9.-]+\.[a-z]+/

export default {
  data () {
    return {
      blacklist: [],
      websiteInput: ''
    }
  },
  computed: {
    error: function () {
      return this.websiteInput.length && !this.websiteInput.match(urlRegex)
    },
    hostname: function () {
      let hostname = new URL(`http://${this.websiteInput}`).hostname
      if (hostname.startsWith('www.') && (hostname.match(/\./g) || []).length === 2) {
        hostname = hostname.substring(4)
      }
      return hostname
    }
  },
  methods: {
    addWebsite: function () {
      if (!this.error && !this.blacklist.includes(this.hostname)) {
        this.blacklist.unshift(this.hostname)
        chrome.storage.local.set({ config: { blacklist: this.blacklist } })
        this.websiteInput = ''
      }
    },
    remove (website) {
      this.blacklist = this.blacklist.filter(x => x !== website)
      chrome.storage.local.set({ config: { blacklist: this.blacklist } })
    }
  },
  created: function () {
    chrome.storage.local.get('config', result => {
      this.blacklist = result.config.blacklist
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
  font-family: "Roboto Bold", "Segoe UI", "Lucida Grande", Tahoma, sans-serif;
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
  color: rgba(0, 0, 0, 0.5);
}

form {
  display: flex;
}
button, input {
  border: none;
  border-radius: 2px;
  padding: 10px;
}
input {
  flex-grow: 1;
  background: rgba(0, 0, 0, 0.1);
}
button {
  min-width: 150px;
  background: #21A868;
  color: white;
  text-transform: uppercase;
  margin-left: 20px;
}

ul {
  padding: 0px;
  margin-top: 20px;
}

ul li {
  list-style: none;
  font-family: 'Roboto';
  padding: 5px 0px;
  display: flex;
  align-items: center;
  transition: all .5s;
  padding: 10px;
  border-radius: 2px;
}

ul li:hover {
  background: rgba(0, 0, 0, 0.05);
}

ul li span.hostname {
  flex-grow: 1;
}

ul li span.delete-icon {
  cursor: pointer;
  padding: 5px;
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
