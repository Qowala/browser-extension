import Website from '../lib/website'
const assert = require('assert')
const { describe, it, before, beforeEach } = require('mocha')
const chrome = require('sinon-chrome')
const mount = require('./mount').default

describe('Options', function () {
  before(function () {
    // Mock chrome with sinon.chrome in order to simulate the browser API
    global.chrome = chrome
    global.URL = require('url').URL
    // Load the code to test
    this.options = mount(require('../lib/options/options.vue'))
    this.twitterWebsite = new Website({
      url: 'twitter.com'
    })
  })

  beforeEach(function () {
    this.options.websites = [ this.twitterWebsite ]
  })

  describe('addWebsite', function () {
    it('should add a website to the blacklist', async function () {
      this.options.websiteInput = 'instagram.com'
      await this.options.addWebsite()
      assert.deepEqual(this.options.websites.map(x => x.url), [
        'https://instagram.com',
        'https://twitter.com'
      ])
    })

    it('should convert hostname without www subdomain', async function () {
      this.options.websiteInput = 'www.facebook.com'
      await this.options.addWebsite()
      assert.deepEqual(this.options.websites.map(x => x.url), [
        'https://facebook.com',
        'https://twitter.com'
      ])
    })

    it('should not add the website if it is already here', function () {
      this.options.websiteInput = 'twitter.com'
      this.options.addWebsite()
      assert.deepEqual(this.options.websites.map(x => x.url), [
        'https://twitter.com'
      ])

      this.options.websiteInput = 'www.twitter.com'
      this.options.addWebsite()
      assert.deepEqual(this.options.websites.map(x => x.url), [
        'https://twitter.com'
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
      assert.equal(this.options.error, false)
    })
  })

  describe('remove', function () {
    it('should remove a given website', function () {
      this.options.remove(this.twitterWebsite)
      assert.deepEqual(this.options.websites, [])
    })
  })
})
