import * as utils from './utils'

export default class Website {
  constructor (data) {
    Object.assign(this, data)
  }

  static fromUrl (url) {
    const ws = new Website({ url, navigationStats: {} })
    ws.fetchMetadata()
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

  async fetchMetadata () {
    if (!this.hasMeta) {
      const doc = new DOMParser().parseFromString(await this.fetchHomepage(), 'text/html')

      const manifestLink = doc.querySelector('link[rel="manifest"]')
      if (manifestLink) {
        const url = new URL(this.url)
        url.pathname = manifestLink.href
        const res = await fetch(url.href)
        const manifest = await res.json()

        if (!manifest['theme_color']) {
          const metaTag = doc.querySelector('meta[name="theme-color"]')
          if (metaTag) {
            manifest['theme_color'] = metaTag.value
          } else {
            manifest['theme_color'] = await this.getColorFromFavicon(doc)
          }
        }

        this.name = manifest.name
        this.color = manifest['theme_color']
      }

      this.hasMeta = true
    }
  }

  async getColorFromFavicon (doc, fallback = '#21A868') {
    return fallback
    // TODO: find color in favicon
    /* const faviconUrl = doc.querySelector('link[rel~="icon"]').href

    try {
      const res = await fetch(faviconUrl)
      const blob = await res.blob()
      const color = await this.getMainColor(blob, fallback)
      return color
    } catch (err) {
      console.error(err)
      return fallback
    } */
  }

  /* getMainColor (blob, fallback) {
    return new Promise((resolve, reject) => {
      blobToBuffer(blob, (err, buff) => {
        if (err) {
          reject(err)
        }

        getPixels(buff, blob.type, (error, pixels) => {
          if (error) {
            reject(error)
          }

          for (const pixel of pixels) {
            if ((pixel[0] !== pixel[1] || pixel[1] !== pixel[2]) && pixel[4] !== 0) { // not black, transparent or white, but a true color
              resolve(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`)
              break
            }
          }

          resolve(fallback) // Fallback to Qowala green
        })
      })
    })
  }
*/
  async fetchHomepage () {
    try {
      const res = await fetch(this.url)
      return res.text()
    } catch (e) {
      console.log(`Error while fetching homepage for ${this.url}`, e)
      return '<html><head></head><body></body></html>'
    }
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
}
