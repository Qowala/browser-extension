import Website from '../lib/website'
const assert = require('assert')
const { describe, it, before, beforeEach } = require('mocha')
const chrome = require('sinon-chrome')
const mount = require('./mount').default

describe('Popup', function () {
  before(function () {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    global.URL = require('url').URL

    this.dates = {
      'Today': new Date(new Date().setHours(0, 0, 0, 0)),
      'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
    }
    this.storage = {
      config: {
        websites: [
          new Website({
            url: 'twitter.com',
            faviconUrl: 'https://twitter.com/favicon.ico',
            navigationStats: {
              [this.dates.Today]: 10
            }
          }),
          new Website({
            url: 'facebook.com',
            faviconUrl: 'https://facebook.com/favicon.ico',
            navigationStats: {
              [this.dates.Today]: 30
            }
          })
        ]
      },
      firstTime: false
    }

    // Load the code to test
    this.popup = mount(require('../lib/popup/popup.vue'))
    this.popup.config = this.storage.config
    this.popup.stats = this.storage.hostNavigationStats
    this.popup.activeURL = 'twitter.com'
  })

  beforeEach(function () {
    // Set config and stats because async code doesn't work
    this.popup.config = JSON.parse(JSON.stringify(this.storage.config))
  })

  describe('percentage', function () {
    it('should correspond to the percentage of time spent on a specific website', function () {
      // We are not computing the real percentage, so let's allow a little difference
      assert.equal((this.popup.percentage - 25) <= 2, true)
    })
  })

  describe('track', function () {
    it('should track current website', async function () {
      this.popup.activeURL = 'https://my-social-network.net'
      await this.popup.track()
      const site = this.popup.config.websites.find(w => w.hostname === 'my-social-network.net')
      assert.equal(site !== null && site !== undefined, true)
      assert.equal(site.navigationStats[this.dates.Today], 1)
    })
    it('should remove www subdomain from website when it is the case', async function () {
      this.popup.activeURL = 'https://www.my-social-network.net'
      await this.popup.track()
      const site = this.popup.config.websites.find(w => w.hostname === 'my-social-network.net')
      const wwwSite = this.popup.config.websites.find(w => w.hostname === 'www.my-social-network.net')
      assert.equal(site !== null && site !== undefined, true)
      assert.equal(wwwSite === null || wwwSite === undefined, true)
      assert.equal(site.navigationStats[this.dates.Today], 1)
    })
  })

  describe('computed tracked', function () {
    it('should return true when website is tracked', function () {
      this.popup.activeURL = 'https://twitter.com'
      assert.equal(this.popup.tracked, true)
    })
    it('should return true even when website has www.', function () {
      this.popup.activeURL = 'https://www.twitter.com'
      assert.equal(this.popup.tracked, true)
    })
    it('should return false even when website has subdomain.', function () {
      this.popup.activeURL = 'https://lol.twitter.com'
      assert.equal(this.popup.tracked, false)
    })
    it('should return false when website is not tracked', function () {
      this.popup.activeURL = 'https://awesome-website.com'
      assert.equal(this.popup.tracked, false)
    })
  })
})
