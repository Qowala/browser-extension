const urlRegex = /[a-z0-9.-]+\.[a-z]+/

const app = new Vue({
  el: '#app',
  data: {
    blacklist: [],
    websiteInput: ''
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
})

if (module) {
  module.exports = app
}
