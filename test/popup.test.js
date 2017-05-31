const assert = require('assert')
const { describe, it, before } = require('mocha')
const chrome = require('sinon-chrome')
const fs = require('fs')
const path = require('path')

// Mock the DOM to allow functions accesssing it to work
require('jsdom-global')(fs.readFileSync(path.join(__dirname, '../lib/popup.html')))

describe('Popup', () => {
  before(() => {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    // Load the code to test
    global.Vue = require('vue')
    this.popup = require('../lib/popup.js')
  })

  describe('formatTime', () => {
    it('should return time in hour when the time spent is over an hour', () => {
      assert.equal(this.popup.formatTime(3650), '1 hour')
    })
    it('should return time in minute when the time spent is over a minute', () => {
      assert.equal(this.popup.formatTime(65), '1 minute')
    })
    it('should return time in second when the time spent is in seconds', () => {
      assert.equal(this.popup.formatTime(1), '1 second')
    })
    it('should return time with plural when the time spent has several units', () => {
      assert.equal(this.popup.formatTime(5), '5 seconds')
    })
  })
})
