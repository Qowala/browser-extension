const assert = require('assert')
const { describe, it, before } = require('mocha')
const chrome = require('sinon-chrome')
const fs = require('fs')
const path = require('path')

// Mock the DOM to allow functions accesssing it to work
require('jsdom-global')(fs.readFileSync(path.join(__dirname, '../lib/popup.html')))

const dates = {
  'Today': new Date(new Date().setHours(0, 0, 0, 0)),
  'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
}
const storage = {
  config: {
    blacklist: [
      'twitter.com'
    ]
  },
  hostNavigationStats: {}
}
storage.hostNavigationStats[dates.Today] = {
  'twitter.com': 10
}

describe('Popup', function () {
  before(function () {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    // Load the code to test
    global.Vue = require('../lib/vue.js')
    chrome.storage.local.set(storage)
    this.popup = require('../lib/popup.js')
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
})
