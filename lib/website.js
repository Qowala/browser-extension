import * as utils from './utils'
import * as Vibrant from 'node-vibrant'

export default class Website {
  constructor (data) {
    Object.assign(this, data)
  }

  static async fromUrl (url) {
    const ws = new Website({ url, navigationStats: {} })
    const faviconUrl = await ws.getFaviconUrl()
    console.log('favicon url:')
    console.log(faviconUrl)
    await ws.fetchMetadata(faviconUrl)
    return ws
  }

  get name () {
    return this._name || this.hostname
  }

  set name (value) {
    this._name = value
  }

  get url () {
    return this._url
  }
  set url (value) {
    this._url = utils.fixUrl(utils.cleanUrl(value))
    this.hostname = new URL(this._url).hostname
  }

  async getFaviconUrl () {
    try {
      const res = await fetch(this.url)
      const html = await res.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const url = doc.querySelector('link[rel~="icon"]').getAttribute('href')
      return (new URL(url, this.url)).href
    } catch (err) {
      return `${this.url}/favicon.ico`
    }
  }

  fetchMetadata (faviconUrl) {
    return new Promise(resolve => {
      if (!this.hasMeta) {
        Vibrant.from(utils.fixUrl(faviconUrl)).getPalette((err, palette) => {
          if (err) {
            console.error(err)
            this.color = '#21a868' // Qowala's green
            return resolve()
          }

          this.faviconUrl = utils.fixUrl(faviconUrl)
          this.color = (palette['Vibrant'] || palette[Object.keys(palette).find(k => palette[k] !== null)]).getHex()
          resolve()
        })

        // Convert mastodon.qowala.org to Qowala's Mastodon
        const splitHost = this.hostname.split('.')
        const caps = str => `${str[0].toUpperCase()}${str.slice(1, str.length)}`
        this.name = splitHost.slice(0, splitHost.length - 1).reverse().map(caps).join(`'s `)

        this.hasMeta = true
      }
    })
  }

  matchUrl (url) {
    try {
      const hostname = new URL(utils.fixUrl(utils.cleanUrl(url))).hostname
      return hostname === this.hostname
    } catch (e) {
      return false
    }
  }

  /**
  * Remember that we were on this site
  */
  isActive () {
    const stats = this.navigationStats[utils.today()]
    this.navigationStats[utils.today()] = stats ? stats + 1 : 1
  }

  /**
  * Returns true if this website has ever been visited
  */
  hasData () {
    return Object.keys(this.navigationStats).length > 0
  }
}
