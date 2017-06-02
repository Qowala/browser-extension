const defaultConfig = {
  blacklist: [
    'facebook.com',
    'messenger.com',
    'twitter.com',
    'youtube.com',
    'dailymotion.com',
    'vimeo.com',
    'instagram.com',
    'periscope.com',
    'linkedin.com',
    'viadeo.com',
    'plus.google.com',
    'tumblr.com',
    'pinterest.com',
    'reddit.com',
    'vk.com',
    'mastodon.qowala.org'
  ]
}

window.setInterval(() => {
  chrome.storage.local.get({
    hostNavigationStats: {},
    config: {
      blacklist: defaultConfig.blacklist
    }
  }, result => {
    chrome.tabs.query({active: true}, tabs => {
      trackWebsite(result, tabs)
      // Persist the updated stats.
      chrome.storage.local.set(result)
    })
  })
}, 1000)

function trackWebsite (result, tabs) {
  const urls = tabs
    .map(tab => new URL(tab.url).hostname)
    .filter(url => url !== '')
    .filter(url => result.config.blacklist.includes(url))

  for (const url of urls) {
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    if (!result.hostNavigationStats[today]) {
      result.hostNavigationStats[today] = {}
    }

    result.hostNavigationStats[today][url] = result.hostNavigationStats[today][url] || 0
    result.hostNavigationStats[today][url]++
  }
  return result
}

if (module) {
  module.exports = { trackWebsite }
}
