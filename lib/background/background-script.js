import defaultConfig from '../assets/defaultSettings.json'
import Website from '../website'

window.setInterval(() => {
  chrome.storage.local.get({
    config: {
      websites: [],
      firstTime: true
    }
  }, result => {
    init(result).then(firstTime => {
      if (!firstTime) {
        result.config.websites = result.config.websites.map(w => new Website(w))
      }

      chrome.tabs.query({ active: true }, tabs => {
        trackWebsite(result, tabs)
        // Persist the updated stats.
        chrome.storage.local.set(result)
      })
    })
  })
}, 1000)

export function trackWebsite (result, tabs) {
  const sites = tabs
    .map(tab => new URL(tab.url).hostname)
    .map(url => result.config.websites.find(w => w.matchUrl(url)))

  for (const site of sites) {
    if (site) {
      site.isActive()
    }
  }
}

async function init (result) {
  if (result.config.firstTime) {
    result.config.firstTime = false
    let sites = []
    for (const url of defaultConfig.websites) {
      sites.push(Website.fromUrl(url))
    }
    result.config.websites = await Promise.all(sites)
    console.log(result.config.websites)
    return true
  }
  return false
}
