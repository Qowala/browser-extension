import * as assert from 'assert'
import { describe, it, beforeEach } from 'mocha'
import Website from '../lib/website'

describe('Website', function () {
  describe('matchUrl', function () {
    beforeEach(function () {
      this.ws = new Website({
        url: 'https://twitter.com',
        navigationStats: {}
      })
    })

    it('should match when the urls are the same', function () {
      assert.equal(true, this.ws.matchUrl('https://twitter.com'))
    })

    it('should match even if no protocol is specified', function () {
      assert.equal(true, this.ws.matchUrl('twitter.com'))
    })

    it('should match even when prefixed with www.', function () {
      assert.equal(true, this.ws.matchUrl('https://www.twitter.com'))
    })

    it('should not match with subdomains that are not www.', function () {
      assert.equal(false, this.ws.matchUrl('https://xxx.twitter.com'))
    })
  })
})
