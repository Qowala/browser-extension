const websiteInput = document.getElementById('website')
const addButton = document.getElementById('addWebsite')
const list = document.getElementById('blacklist')

browser.storage.local.get('config').then(result => {
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
      browser.storage.local.set(result).then(res => {
        console.log('Successfully saved settings', res)
      }).catch(err => {
        console.log(`Error while saving settings: ${err}`)
      })
    }
  }
})
