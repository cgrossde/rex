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
    {startRegEx: '', stopRegEx: '', title: '', color: '#CCC', active: false}
  ]
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({currentProfile: defaultProfile, profiles: [defaultProfile]}, function () {
    console.log("Default profile initialized", defaultProfile)
  })
  chrome.storage.local.set({extensionEnabled: true}, () => {})
})



















