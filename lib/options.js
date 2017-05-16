const websiteInput = document.getElementById('website')
const addButton = document.getElementById('addWebsite')
const list = document.getElementById('blacklist')

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
      addToList(websiteInput.value.replace('http://', '').replace('https://'), true)
      websiteInput.value = ''
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
