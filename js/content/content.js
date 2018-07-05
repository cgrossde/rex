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
      alert("Profile was changed in options, refresh page.")
    }
  })
}

function getProfiles() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['profiles'], ({profiles}) => resolve(profiles))
  })
}

/**
 * Inject profiles and load content_module.js as a module to allow for using imports
 */
function loadExtension(profiles) {
  const listOfProfilesScript = document.createElement('script');
  listOfProfilesScript.text = "window.ext_rex_profile_list = JSON.parse('" + JSON.stringify(profiles) + "');"
  document.head.appendChild(listOfProfilesScript);
  const script = document.createElement('script')
  script.setAttribute("type", "module")
  script.setAttribute("src", chrome.extension.getURL('js/content/content_module.js'))
  document.head.appendChild(script);
}
