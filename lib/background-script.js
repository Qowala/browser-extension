const defaultConfig = {
  blacklist: [
    'facebook.com',
    'www.facebook.com',
    'messenger.com',
    'www.messenger.com',
    'twitter.com',
    'www.twitter.com',
    'www.youtube.com',
    'youtube.com',
    'dailymotion.com',
    'www.dailymotion',
    'vimeo.com',
    'www.vimeo.com',
    'instagram.com',
    'www.instagram.com',
    'periscope.com',
    'www.periscope.com',
    'linkedin.com',
    'www.linkedin.com',
    'viadeo.com',
    'www.viadeo.com',
    'plus.google.com',
    'tumblr.com',
    'www.tumblr',
    'pinterest.com',
    'www.pinterest.com',
    'reddit.com',
    'www.reddit.com',
    'www.vk.com',
    'vk.com',
    'mastodon.qowala.org'
  ]
}

window.setInterval(() => {
  browser.storage.local.get({
    hostNavigationStats: {},
    config: {
      blacklist: defaultConfig.blacklist
    }
  }).then(result => {
    chrome.tabs.query({active: true}, tabs => {
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

      // Persist the updated stats.
      browser.storage.local.set(result)
    })
  })
}, 1000)
