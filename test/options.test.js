const assert = require('assert')
const { describe, it, before, beforeEach } = require('mocha')
const chrome = require('sinon-chrome')
const fs = require('fs')
const path = require('path')

// Mock the DOM to allow functions accesssing it to work
require('jsdom-global')(fs.readFileSync(path.join(__dirname, '../lib/options.html')))

describe('Options', function () {
  before(function () {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    // Load the code to test
    global.Vue = require('../lib/vue.js')
    this.options = require('../lib/options.js')
  })

  beforeEach(function () {
    this.options.blacklist = [ 'twitter.com' ]
  })

  describe('addWebsite', function () {
    it('should add a website to the blacklist', function () {
      this.options.websiteInput = 'facebook.com'
      this.options.addWebsite()
      assert.deepEqual(this.options.blacklist, [
        'facebook.com',
        'twitter.com'
      ])
    })

    it('should convert hostname without www subdomain', function () {
      this.options.websiteInput = 'www.facebook.com'
      this.options.addWebsite()
      assert.deepEqual(this.options.blacklist, [
        'facebook.com',
        'twitter.com'
      ])
    })

    it('should not add the website if it is already here', function () {
      this.options.websiteInput = 'twitter.com'
      this.options.addWebsite()
      assert.deepEqual(this.options.blacklist, [
        'twitter.com'
      ])

      this.options.websiteInput = 'www.twitter.com'
      this.options.addWebsite()
      assert.deepEqual(this.options.blacklist, [
        'twitter.com'
      ])
    })
  })

  describe('error', function () {
    it('should be true if the URL is not valid', function () {
      this.options.websiteInput = 'Twitter'
      assert.equal(this.options.error, true)
    })

    it('should be false if the URL is valid', function () {
      this.options.websiteInput = 'twitter.com'
      assert.equal(this.options.error, false)
    })

    it('should be false if there is no URL', function () {
      this.options.websiteInput = ''
      assert.equal(this.options.error, true)
    })
  })

  describe('remove', function () {
    it('should remove a given website', function () {
      this.options.remove('twitter.com')
      assert.deepEqual(this.options.blacklist, [])
    })
  })
})
