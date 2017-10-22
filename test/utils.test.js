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
})
