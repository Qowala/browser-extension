const websiteInput = document.getElementById('website')
const addButton = document.getElementById('addWebsite')
const list = document.getElementById('blacklist')
const error = document.getElementById('error')

chrome.storage.local.get('config', result => {
  addButton.addEventListener('click', addWebsite)
  websiteInput.addEventListener('keyup', evt => {
    if (evt.keyCode === 13) { // Enter
      addWebsite()
    }
  })

  for (const url of result.config.blacklist) {
    addToList(url, false)
  }

  function addWebsite () {
    if (websiteInput.validity.valid) {
      addToList(new URL(`http://${websiteInput.value}`).hostname, true)
      websiteInput.value = ''
    } else {
      error.className = 'show'
      setTimeout(() => {
        error.className = 'hide'
      }, 5000)
    }
  }

  function addToList (url, save) {
    if (result.config.blacklist.includes(url) && save) {
      return
    }
    const li = document.createElement('li')
    li.innerHTML = url
    list.prepend(li)
    if (save) {
      result.config.blacklist.push(url)
      chrome.storage.local.set(result)
    }
  }
})
