import Profile from "./Profile.js";

async function getProfiles() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['profiles'], async ({profiles}) => {
      let mappedProfiles = profiles.map(profile => Object.assign(new Profile, profile));
      resolve(mappedProfiles)
    })
  })
}

async function setProfiles(profiles) {
  return new Promise(resolve => {
    chrome.storage.sync.set({profiles}, resolve)
  })
}

async function addProfile(newProfile) {
  const profiles = await getProfiles()
  profiles.push(newProfile)
  return setProfiles(profiles);
}

async function saveProfile(newProfile) {
  const profiles = await getProfiles()
  const oldProfileIndex = profiles.map(profile => profile.id).indexOf(newProfile.id)
  profiles[oldProfileIndex] = newProfile
  return setProfiles(profiles);
}

async function newProfile(profileName) {
  const newProfile = new Profile(profileName)
  await addProfile(newProfile)
  return newProfile
}

async function deleteProfile(obsoleteProfile) {
  const profiles = await getProfiles()
  const newProfiles = profiles.filter(profile => profile.id !== obsoleteProfile.id)
  return setProfiles(newProfiles)
}

export default {
  getProfiles,
  newProfile,
  saveProfile,
  deleteProfile
}