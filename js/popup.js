'use strict';

import Profile from './options/Profile.js';

window.onload = function () {
  const btnToggleActive = document.getElementById('btn-toggle-activation')
  const btnOpenOptions = document.getElementById('btn-open-options')
  const activeProfileList = document.getElementById('active-profiles')
  const refreshInfo = document.getElementById('refresh')
  const btnRefresh = document.getElementById('refresh-button')


  updateToggleActiveButton(btnToggleActive)
  btnToggleActive.addEventListener('click', toggleActiveStatus)
  btnOpenOptions.addEventListener('click', () => chrome.runtime.openOptionsPage())
  btnRefresh.addEventListener('click', () => {
    refreshInfo.style.display = 'none'
    chrome.tabs.reload()
  })

  updateListOfActiveProfiles(activeProfileList)

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && 'extensionEnabled' in changes) {
      refreshInfo.style.display = 'block'
    }
  })
}

const getCurrentTab = () => new Promise((resolve, reject) => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const currentTab = tabs[0]
    resolve(currentTab)
  })
})

function renderActiveProfiles(element, profiles) {
  element.innerHTML = profiles.map(profile => {
    return `<li>${profile.name}</li>`
  }).join('')
}

function toggleActiveStatus() {
  const element = this
  chrome.storage.local.get(['extensionEnabled'], ({extensionEnabled}) => {
    console.log('extensionEnabled', extensionEnabled)
    chrome.storage.local.set({extensionEnabled: !extensionEnabled}, () => {
      updateToggleActiveButton(element)
    })
  })
}

function updateToggleActiveButton(element) {
  chrome.storage.local.get(['extensionEnabled'], ({extensionEnabled}) => {
    if (extensionEnabled) {
      element.className = 'enabled'
      element.value = 'Enabled'
    } else {
      element.className = 'disabled'
      element.value = 'Disabled'
    }
  })
}

function updateListOfActiveProfiles(element) {
  chrome.storage.sync.get(['profiles'], async ({profiles}) => {
    profiles = profiles.map(profile => Object.assign(new Profile(), profile))
    const currentTab = await getCurrentTab()
    const activeProfiles = profiles.filter(profile => profile.isActive(currentTab.url))
    console.log('Active profiles', activeProfiles, currentTab)
    if (activeProfiles.length > 0) {
      renderActiveProfiles(element, activeProfiles)
    } else {
      element.innerHTML = '<li>None</li>'
    }
  })
}
