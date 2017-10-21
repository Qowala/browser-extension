import defaultConfig from '../assets/defaultSettings.json'
import Website from '../website'

window.setInterval(() => {
  chrome.storage.local.get({
    config: {
      websites: [],
      firstTime: true
    }
  }, result => {
    if (!init(result)) {
      result.config.websites = result.config.websites.map(w => new Website(w))
    }

    chrome.tabs.query({ active: true }, tabs => {
      trackWebsite(result, tabs)
      // Persist the updated stats.
      chrome.storage.local.set(result)
    })
  })
}, 1000)

function trackWebsite (result, tabs) {
  const sites = tabs
    .map(tab => new URL(tab.url).hostname)
    .map(url => result.config.websites.find(w => w.matchUrl(url)))

  for (const site of sites) {
    if (site) {
      site.isActive()
    }
  }
}

function init (result) {
  if (result.config.firstTime) {
    result.config.firstTime = false
    for (const url of defaultConfig.websites) {
      result.config.websites.push(Website.fromUrl(url))
    }
  }
  return result.config.firstTime
}

if (module) {
  module.exports = { trackWebsite }
}
