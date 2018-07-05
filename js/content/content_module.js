import {regexHighlight} from './regexHighlighter.js'
import Profile from '../options/Profile.js'


// INIT
const activeProfiles = window.ext_rex_profile_list
  .map(profile => Object.assign(new Profile(), profile))
  .filter(profile => profile.isActive(window.location.href))
if (activeProfiles.length > 0)
  run(activeProfiles)

function run(profiles) {
  const highlightConfigs = []
  profiles.forEach(profile => highlightConfigs.push(...profile.highlight))
  regexHighlight(highlightConfigs)

  // TODO: Collapsable text
}
