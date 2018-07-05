import ProfileStore from "./ProfileStore.js";
import HighlightEditComponent from './highlight-edit.component.js'
import PagesEditComponent from './pages-edit.component.js'
import Profile, {Highlight, Page} from "./Profile.js";

const defaultProfile = {
  id: "1",
  name: "Default",
  highlight: [{ regEx: "News", color: "#c2cc4e", active: true }],
  pages: [
    { regEx: "google.*", active: true },
  ],
  collapse: [
    { startRegEx: "", stopRegEx: "", title: "", color: "#CCC", active: false }
  ]
};


const app = new Vue({
  el: "#app",
  data: {
    profiles: [], // Will be set after init
    currentProfile: false, // Will be set after init
    newProfileName: '',
    showAddProfilForm: false,
    appLoaded: false
  },
  methods: {
    createProfile: async function () {
      this.currentProfile = this.setCurrentProfile(await ProfileStore.newProfile(this.newProfileName))
      this.showAddProfilForm = false
      this.newProfileName = ''
    },
    deleteProfile: async function () {
      if (window.confirm(`Do you really want to delete ${this.currentProfile.name}?`)) {
        await ProfileStore.deleteProfile(this.currentProfile)
      }
    },
    saveCurrentProfile: async function () {
      await ProfileStore.saveProfile(this.currentProfile)
    },
    setCurrentProfile: function(currentProfile) {
      this.currentProfile = Vue.util.extend(new Profile(), currentProfile)
    },
    changeCurrentProfile: function(event) {
      const newCurrentProfile = this.profiles.find(profile => profile.id === event.target.value)
      this.setCurrentProfile(newCurrentProfile)
    }
  }
});

ProfileStore.getProfiles().then(profiles => {
  app.profiles = profiles
  if (profiles.length > 0) {
    app.setCurrentProfile(profiles[0])
  }
  app.appLoaded = true
})

// Auto update profiles list
chrome.storage.onChanged.addListener(async function (changes, namespace) {
  const profilesChanged = namespace === 'sync' && 'profiles' in changes
  if (profilesChanged) {
    app.profiles = changes.profiles.newValue
    const currentProfileDeleted = app.profiles.every(profile => profile.id !== app.currentProfile.id)
    if (currentProfileDeleted && app.profiles.length > 0) {
      app.currentProfile = app.setCurrentProfile(app.profiles[0])
    }
  }
})