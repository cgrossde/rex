import {regexHighlight} from './regexHighlighter.js'
import Profile from '../options/Profile.js'
import {collapseText} from './collapseText.js';


// INIT
const profileList = window.ext_rex_profile_list || []
const activeProfiles = profileList
  .map(profile => Object.assign(new Profile(), profile))
  .filter(profile => profile.isActive(window.location.href))
if (activeProfiles.length > 0)
  run(activeProfiles)

function run(profiles) {
  const highlightConfigs = []
  const collapseConfigs = []
  profiles.forEach(profile => {
    highlightConfigs.push(...profile.highlight)
    collapseConfigs.push(...profile.collapse)
  })

  let startTime = new Date()
  // Collapse first otherwise highlighting might break the search for collapsable text
  collapseConfigs.forEach(config => collapseText(config))
  console.log(`Collapse took ${new Date().getTime() - startTime.getTime()}ms`)

  // Then highlight
  startTime = new Date()
  regexHighlight(highlightConfigs)
  console.log(`Highlight took ${new Date().getTime() - startTime.getTime()}ms`)
}
