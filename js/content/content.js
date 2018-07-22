'use strict'

chrome.storage.local.get(['extensionEnabled'], ({extensionEnabled}) => {
  if (extensionEnabled && !chrome.devtools) {
    notifyUserIfProfileChanged();
    getProfiles()
      .then(loadExtension)
  }
})

function notifyUserIfProfileChanged() {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'sync' && 'profiles' in changes) {
      const activeProfilesOnPage = getChangedProfiles(changes.profiles.oldValue, changes.profiles.newValue)
        .some(profile => {
          return profile.pages.some(page => {
            const pageRegexp = RegExp(page.regEx)
            return page.active && page.regEx !== '' && pageRegexp.test(document.location.href)
          })
        })
      if (activeProfilesOnPage)
        alert("Profile was changed in options, refresh page.")
    }
  })
}

function getChangedProfiles(oldProfiles, newProfiles) {
  return newProfiles.filter(newProfile => {
    const oldProfile = oldProfiles.filter(oldProfile => oldProfile.id === newProfile.id)[0] || null
    if (!oldProfile)
      return false
    return JSON.stringify(oldProfile) !== JSON.stringify(newProfile)
  })
}

function getProfiles() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['profiles'], ({profiles}) => resolve(profiles))
  })
}

/**
 * Inject profiles and load rex_extension.js as a module to allow for using imports
 */
function loadExtension(profiles) {
  const listOfProfilesScript = document.createElement('script');
  let profileJSON = JSON.stringify(profiles, backslashReplacer);
  listOfProfilesScript.text = "window.ext_rex_profile_list = JSON.parse('" + profileJSON + "');"
  document.head.appendChild(listOfProfilesScript);
  const script = document.createElement('script')
  script.setAttribute("type", "module")
  script.setAttribute("src", chrome.extension.getURL('js/content/rex_extension.js'))
  document.head.appendChild(script);
}

function backslashReplacer(key, value) {
  if ( typeof value == "string")
  {
    value = value.replace(/\\/g, "\\\\");
  }
  return value;
}