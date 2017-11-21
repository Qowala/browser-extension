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
    it('should return time in hour when the time spent is over an hour', function () {
      assert.equal(utils.formatTime(3650), '1 hour')
    })
    it('should return time in minute when the time spent is over a minute', function () {
      assert.equal(utils.formatTime(65), '1 minute')
    })
    it('should return time in second when the time spent is in seconds', function () {
      assert.equal(utils.formatTime(1), '1 second')
    })
    it('should return time with plural when the time spent has several units', function () {
      assert.equal(utils.formatTime(5), '5 seconds')
    })
  })
})
