const assert = require('assert')
const { describe, it, before, beforeEach } = require('mocha')
const chrome = require('sinon-chrome')

const dates = {
  'Today': new Date(new Date().setHours(0, 0, 0, 0)),
  'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
}
const storage = {
  config: {
    blacklist: [
      'twitter.com',
      'www.api.twitter.com'
    ]
  },
  hostNavigationStats: {}
}

describe('Background script', function () {
  before(function () {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    // Load the code to test
    chrome.storage.local.set(storage)
    this.bgScript = require('../lib/background-script.js')
  })

  beforeEach(function () {
    // Reset counter
    storage.hostNavigationStats[dates.Today] = {
      'twitter.com': 10
    }
  })

  describe('trackWebsite', function () {
    it('should increment time on current website', function () {
      const tabs = [{url: 'https://twitter.com/test'}]
      const trackingResult = this.bgScript.trackWebsite(storage, tabs)
      const twitterTracking = trackingResult.hostNavigationStats[dates.Today]['twitter.com']
      assert.equal(twitterTracking, 11)
    })
    it('should track website with www subdomain even when not specified', function () {
      const tabs = [{url: 'https://www.twitter.com/test'}]
      const trackingResult = this.bgScript.trackWebsite(storage, tabs)
      const twitterTracking = trackingResult.hostNavigationStats[dates.Today]['twitter.com']
      assert.equal(twitterTracking, 11)
    })
    it('should track website with special www subdomain as is', function () {
      const tabs = [{url: 'https://www.api.twitter.com/test'}]
      const trackingResult = this.bgScript.trackWebsite(storage, tabs)
      const twitterTracking = trackingResult.hostNavigationStats[dates.Today]['twitter.com']
      const twitterApiTracking = trackingResult.hostNavigationStats[dates.Today]['www.api.twitter.com']
      assert.equal(twitterTracking, 10)
      assert.equal(twitterApiTracking, 1)
    })
    it('should not increment time on website which is not tracked', function () {
      const tabs = [{url: 'https://example.com/test'}]
      const trackingResult = this.bgScript.trackWebsite(storage, tabs)
      const exampleTracking = trackingResult.hostNavigationStats[dates.Today]['example.com']
      assert.equal(exampleTracking, undefined)
    })
  })
})