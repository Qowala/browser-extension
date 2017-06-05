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
      // Temporary function to transition the data: to be removed in next versions
      // Converts www.example.com websites to example.com
      result.config.blacklist = cleanHostnames(result.config.blacklist)
      // Persist the updated stats.
      chrome.storage.local.set(result)
    })
  })
}, 1000)

function trackWebsite (result, tabs) {
  const urls = tabs
    .map(tab => new URL(tab.url).hostname)
    .filter(url => url !== '')
    // Check if website is tracked with tolerance on 'www.'
    .filter(url => result.config.blacklist.includes(url) ||
                   (result.config.blacklist.includes(url.substring(4)) &&
                   url.startsWith('www.')))

  for (var url of urls) {
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    if (!result.hostNavigationStats[today]) {
      result.hostNavigationStats[today] = {}
    }

    // Convert www.example.com domain to simple example.com
    if (url.startsWith('www.') && (url.match(/\./g) || []).length === 2) {
      url = url.substring(4)
    }

    result.hostNavigationStats[today][url] = result.hostNavigationStats[today][url] || 0
    result.hostNavigationStats[today][url]++
  }
  return result
}

function cleanHostnames (hostnames) {
  hostnames = hostnames.map(
    function (hostname) {
      if (hostname.startsWith('www.') && (hostname.match(/\./g) || []).length === 2) {
        hostname = hostname.substring(4)
      }
      return hostname
    }
  )
  return hostnames.filter((hostname, pos, self) => self.indexOf(hostname) === pos)
    // Remove typos from the previous blacklist
    .filter(hostname => hostname !== 'www.dailymotion' && hostname !== 'www.tumblr')
}

if (module) {
  module.exports = { trackWebsite, cleanHostnames }
}
