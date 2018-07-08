import {generateGUID} from '../content/util.js'

export default class Profile {
  constructor(profileName) {
    this.name = profileName
    this.id = generateGUID()
    this.highlight = []
    this.pages = []
    this.collapse = []
  }

  addHighlight(highlight) {
    highlight = highlight || new Highlight()
    this.highlight.push(highlight)
  }

  removeHighlight(obsoleteHighlight) {
    this.highlight.splice(this.highlight.indexOf(obsoleteHighlight), 1)
  }

  addPage(page) {
    page = page || new Page()
    this.pages.push(page)
  }

  removePage(obsoletePage) {
    this.pages.splice(this.pages.indexOf(obsoletePage), 1)
  }

  addCollapse(collapse) {
    collapse = collapse || new Collapse()
    this.collapse.push(collapse)
  }

  removeCollapse(obsoleteCollapse) {
    this.collapse.splice(this.collapse.indexOf(obsoleteCollapse), 1)
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
    this.color = randomColor(0x99, 0xFF)
  }
}

export class Collapse {
  constructor() {
    this.active = true
    this.title = ''
    this.startRegEx = ''
    this.stopRegEx = ''
    this.color = randomColor(0x99, 0xFF)
  }
}

function randomColor(min, max) {
  const randomHex = (min, max) => (Math.random()*(max-min)+min<<0).toString(16)
  return '#' + randomHex(min, max) + randomHex(min, max) + randomHex(min, max)
}