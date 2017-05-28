var assert = require('assert')
var mocha = require('mocha')
var describe = mocha.describe
var it = mocha.it
var before = mocha.before

var chrome = require('sinon-chrome')

var html = `
<!DOCTYPE html>
<html>
  <meta charset="UTF-8">
  <head>
     <link rel="stylesheet" href="../assets/popup.css">
  </head>
  <body>
    <header>
      <img src="../assets/white_logo.png" alt="Qowala logo"/>
      <span>Hey, it's your friends at Qowala!</span>
      <div></div>
    </header>
    <div class="non-measure-display">
      <h3>This website is not tracked!</h3>
    </div>
    <div class="measure-display">
      <h3>You've spent...</h3>
      <div class="time-spent"></div>
      <div class="parameters">
        On <select class="parameters__dropdown network"></select>
        <select class="parameters__dropdown date"></select>
      </div>
    </div>
    <script src="popup.js"></script>
  </body>
</html>`

// Mock the DOM to allow functions accesssing it to work
require('jsdom-global')(html)

describe('Popup', () => {
  before(() => {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    // Load the code to test
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
