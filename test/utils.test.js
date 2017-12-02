import * as utils from '../lib/utils'
const assert = require('assert')
const { describe, it } = require('mocha')

describe('Utils', function () {
  describe('cleanUrl', function () {
    it('should convert websites in the form of www.example.com', function () {
      const inputHostnames = [
        'facebook.com',
        'www.messenger.com',
        'www.twitter.com',
        'www.api.twitter.com'
      ]
      const expectedHostnames = [
        'facebook.com',
        'messenger.com',
        'twitter.com',
        'api.twitter.com'
      ]
      assert.deepEqual(inputHostnames.map(h => utils.cleanUrl(h)), expectedHostnames)
    })
  })

  describe('fixUrl', function () {
    it('should prefix URLs with https://, but only if needed', function () {
      const inputUrls = [
        'facebook.com',
        'https://messenger.com',
        'http://twitter.com',
        'www.api.twitter.com'
      ]
      const expectedUrls = [
        'https://facebook.com',
        'https://messenger.com',
        'http://twitter.com',
        'https://www.api.twitter.com'
      ]
      assert.deepEqual(inputUrls.map(u => utils.fixUrl(u)), expectedUrls)
    })
  })

  describe('formatTime', function () {
    it('should show seconds if under one minute', function () {
      assert.equal(utils.formatTime(30), '30 seconds')
    })

    it('should not show seconds if over one minute', function () {
      assert.equal(utils.formatTime(60), '1 minute')
    })

    it('should show minutes and hours if over one hour', function () {
      assert.equal(utils.formatTime(3600 + 120), '1 hour and 2 minutes')
    })

    it('should pluralize words correctly', function () {
      assert.equal(utils.formatTime(1), '1 second')
      assert.equal(utils.formatTime(2), '2 seconds')

      assert.equal(utils.formatTime(60), '1 minute')
      assert.equal(utils.formatTime(120), '2 minutes')

      assert.equal(utils.formatTime(3600), '1 hour')
      assert.equal(utils.formatTime(7200), '2 hours')
    })

    describe('short', function () {
      it('should show seconds if under one minute', function () {
        assert.equal(utils.formatTime(30, false), '30s')
      })

      it('should not show seconds if over one minute', function () {
        assert.equal(utils.formatTime(60, false), '1m')
      })

      it('should show minutes and hours if over one hour', function () {
        assert.equal(utils.formatTime(3600 + 120, false), '1h2m')
      })
    })
  })
})
