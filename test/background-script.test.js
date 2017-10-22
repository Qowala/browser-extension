import Website from '../lib/website'
const assert = require('assert')
const { describe, it, before, beforeEach } = require('mocha')
const chrome = require('sinon-chrome')

const dates = {
  'Today': new Date(new Date().setHours(0, 0, 0, 0)),
  'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
}

describe('Background script', function () {
  before(function () {
    require('jsdom-global')('')
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    global.URL = require('url').URL
    // Load the code to test
    this.bgScript = require('../lib/background/background-script.js')
  })

  beforeEach(function () {
    // Reset counter
    this.storage = {
      config: {
        websites: [
          new Website({
            url: 'twitter.com',
            navigationStats: {
              [dates.Today.toString()]: 10
            }
          }),
          new Website({
            url: 'www.api.twitter.com',
            navigationStats: {}
          })
        ]
      }
    }
  })

  describe('trackWebsite', function () {
    it('should increment time on current website', function () {
      const tabs = [{ url: 'https://twitter.com/test' }]
      this.bgScript.trackWebsite(this.storage, tabs)
      const twitterTracking = this.storage.config.websites[0].navigationStats[dates.Today]
      assert.equal(twitterTracking, 11)
    })
    it('should track website with www subdomain even when not specified', function () {
      const tabs = [{ url: 'https://www.twitter.com/test' }]
      this.bgScript.trackWebsite(this.storage, tabs)
      const twitterTracking = this.storage.config.websites[0].navigationStats[dates.Today]
      assert.equal(twitterTracking, 11)
    })
    it('should track website with special www subdomain as is', function () {
      const tabs = [{ url: 'https://www.api.twitter.com/test' }]
      this.bgScript.trackWebsite(this.storage, tabs)
      const twitterTracking = this.storage.config.websites[0].navigationStats[dates.Today]
      const twitterApiTracking = this.storage.config.websites[1].navigationStats[dates.Today]
      assert.equal(twitterTracking, 10)
      assert.equal(twitterApiTracking, 1)
    })
    it('should not increment time on website which is not tracked', function () {
      const tabs = [{ url: 'https://example.com/test' }]
      this.bgScript.trackWebsite(this.storage, tabs)
      assert.equal(this.storage.config.websites.length, 2)
    })
  })
})
