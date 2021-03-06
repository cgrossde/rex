"use strict";

const defaultProfile = {
  id: "1",
  name: "Default",
  highlight: [
    {regEx: 'lorem', color: '#c2cc4e', active: true},
    {regEx: 'ipsum', color: '#b1f6a0', active: true}
  ],
  pages: [
    {regEx: 'google', active: true},
  ],
  collapse: [
    {startRegEx: 'at com.sun.jersey.api', stopRegEx: 'at com.apache.catalina', title: 'Framework noise', color: '#CCC', active: false}
  ]
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.sync.set({currentProfile: defaultProfile, profiles: [defaultProfile]}, function () {
      console.log("Default profile initialized", defaultProfile)
    })
    chrome.storage.local.set({extensionEnabled: true}, () => {})
  }
})



















