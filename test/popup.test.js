import Website from '../lib/website'
const assert = require('assert')
const { describe, it, before, beforeEach } = require('mocha')
const chrome = require('sinon-chrome')
const mount = require('./mount').default

const dates = {
  'Today': new Date(new Date().setHours(0, 0, 0, 0)),
  'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
}
const storage = {
  config: {
    websites: [
      new Website({
        url: 'twitter.com',
        navigationStats: {
          [dates.Today]: 10
        }
      }),
      new Website({
        url: 'facebook.com',
        navigationStats: {
          [dates.Today]: 30
        }
      })
    ]
  },
  firstTime: false
}

describe('Popup', function () {
  before(function () {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    // Load the code to test
    this.popup = mount(require('../lib/popup/popup.vue'))
    this.popup.config = storage.config
    this.popup.stats = storage.hostNavigationStats
    this.popup.hostname = this.popup.activeURL = 'twitter.com'
  })

  beforeEach(function () {
    // Set config and stats because async code doesn't work
    this.popup.config = JSON.parse(JSON.stringify(storage.config))
    this.popup.stats = JSON.parse(JSON.stringify(storage.hostNavigationStats))
  })

  describe('formatTime', function () {
    it('should return time in hour when the time spent is over an hour', function () {
      assert.equal(this.popup.formatTime(3650), '1 hour')
    })
    it('should return time in minute when the time spent is over a minute', function () {
      assert.equal(this.popup.formatTime(65), '1 minute')
    })
    it('should return time in second when the time spent is in seconds', function () {
      assert.equal(this.popup.formatTime(1), '1 second')
    })
    it('should return time with plural when the time spent has several units', function () {
      assert.equal(this.popup.formatTime(5), '5 seconds')
    })
  })

  describe('percentage', function () {
    it('should correspond to the percentage of time spent on a specific website', function () {
      assert.equal(this.popup.percentage, 25)
    })
  })

  describe('track', function () {
    it('should track current website', function () {
      this.popup.hostname = 'my-social-network.net'
      this.popup.track()
      assert.equal(this.popup.config.blacklist.includes('my-social-network.net'), true)
      assert.equal(this.popup.stats[dates.Today]['my-social-network.net'], 1)
    })
    it('should remove www subdomain from website when it is the case', function () {
      this.popup.hostname = 'www.my-social-network.net'
      this.popup.track()
      assert.equal(this.popup.config.blacklist.includes('my-social-network.net'), true)
      assert.equal(this.popup.config.blacklist.includes('www.my-social-network.net'), false)
      assert.equal(this.popup.stats[dates.Today]['my-social-network.net'], 1)
      assert.equal(this.popup.stats[dates.Today]['www.my-social-network.net'], undefined)
    })
  })

  describe('computed tracked', function () {
    it('should return true when website is tracked', function () {
      this.popup.hostname = 'twitter.com'
      assert.equal(this.popup.tracked, true)
    })
    it('should return true even when website has www.', function () {
      this.popup.hostname = 'www.twitter.com'
      assert.equal(this.popup.tracked, true)
    })
    it('should return false even when website has subdomain.', function () {
      this.popup.hostname = 'lol.twitter.com'
      assert.equal(this.popup.tracked, false)
    })
    it('should return false when website is not tracked', function () {
      this.popup.hostname = 'awesome-website.com'
      assert.equal(this.popup.tracked, false)
    })
  })
})
