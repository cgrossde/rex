import {generateGUID} from '../content/util.js'

export default class Profile {
  constructor(profileName) {
    this.name = profileName
    this.id = generateGUID()
    this.highlight = []
    this.pages = []
    this.collapse = []
  }

  addHighlight() {
    this.highlight.push(new Highlight())
  }

  removeHighlight(obsoleteHighlight) {
    this.highlight.splice(this.highlight.indexOf(obsoleteHighlight), 1)
  }

  addPage() {
    this.pages.push(new Page())
  }

  removePage(obsoletePage) {
    this.pages.splice(this.pages.indexOf(obsoletePage), 1)
  }

  isActive(url) {
    return this.pages.some(page => {
      const pageRegexp = RegExp(page.regEx)
      return page.active && page.regEx !== '' && pageRegexp.test(url)
    })
  }
}

export class Page {
  constructor() {
    this.regEx = ''
    this.active = true
  }
}

export class Highlight {
  constructor() {
    this.regEx = ''
    this.active = true
    this.color = this.randomLightColor()
  }

  randomLightColor() {
    const min = 0x99
    const max = 0xFF
    const randomHex = (min, max) => (Math.random()*(max-min)+min<<0).toString(16)
    return '#' + randomHex(min, max) + randomHex(min, max) + randomHex(min, max)
  }
}