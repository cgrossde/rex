const EXCLUDES = ['HTML', 'NOSCRIPT', 'HEAD', 'STYLE', 'TITLE', 'LINK', 'SCRIPT', 'OBJECT', 'IFRAME']

/**
 * Improved regex highlighter which can highlight across tags
 *
 * Is around 30% slower than simple regex highlighter but still <100ms for big DOMs
 * and <10ms for normal DOMs
 */

function walkDOM(node, func) {
  let currentNode = node.firstChild
  func(node)

  while (currentNode) {
    if (!EXCLUDES.includes(currentNode.nodeName))
      walkDOM(currentNode, func)
    currentNode = currentNode.nextSibling
  }
}

export function regexHighlightAcrossTags(highlightConfigs, searchNode) {
  searchNode = searchNode || document.body
  const {fullText, charPosToNodeMap} = buildTextToNodeMap(searchNode)
  const configs = getActivePrecompiledHighlightConfigs(highlightConfigs)

  configs.forEach(config => {
    const highlightWrapperNode = createElementFromHTML(`<span class="ext-rex-highlighted-text" style="background-color: ${config.color}"></span>`)
    let result;
    while ((result = config.regEx.exec(fullText)) !== null) {
      const [match, startPos] = [result.shift(), result.index]
      if (result.length > 0) {
        // We have capturing groups
        while (result.length > 0) {
          const groupMatch = result.pop()
          const groupStartPos = startPos + match.indexOf(groupMatch)
          highlightMatch(groupStartPos, groupMatch, charPosToNodeMap, highlightWrapperNode)
        }
      } else {
        // Simple match
        highlightMatch(startPos, match, charPosToNodeMap, highlightWrapperNode)
      }
    }
  })
}

function getActivePrecompiledHighlightConfigs(highlightConfigs) {
  return highlightConfigs
    .filter(config => config.active && config.regEx !== '')
    // Only valid regEx
    .filter(config => {
      try {
        new RegExp(config.regEx, 'gim')
        return true
      } catch (e) {
        console.log(e.message)
        return false
      }
    })
    .map(config => {
      // g - global, i - caseinsensitive, m - multiline search context
      return {
        regEx: new RegExp(config.regEx, 'gim'),
        color: config.color
      }
    })
}

function updateCharPosToNodeMap(charPosToNodeMap, index, node) {
  charPosToNodeMap[index] = node
  for (let i = 1; i < node.textContent.length; i++) {
    charPosToNodeMap[index + i] = index
  }
}

function highlightMatch(startPos, groupMatch, charPosToNodeMap, highlightWrapperNode) {
  const endPos = startPos + groupMatch.length - 1
  const affectedNodes = findNodesOfMatch(startPos, endPos, charPosToNodeMap, groupMatch)
  affectedNodes.forEach(node => replaceNodeWithHighlightedMatch(node, highlightWrapperNode, charPosToNodeMap))
}

/*    startIndex: 0
      endIndex: 7
      matchStartPos: 6
      matchEndPos: 7
      node: text
      length: 8
      text: "Lorem ip"  */
function replaceNodeWithHighlightedMatch(affectedNode, highlightWrapperNode, charPosToNodeMap) {
  // Piece together new html
  const text = affectedNode.text()
  let newNodes = []
  // Pre-match
  if (affectedNode.matchStartPos !== 0) {
    const preMatchNode = document.createTextNode(text.substring(0, affectedNode.matchStartPos))
    newNodes.push(preMatchNode)
    updateCharPosToNodeMap(charPosToNodeMap, affectedNode.startIndex, preMatchNode)
  }
  // Match
  let matchNode = document.createTextNode(text.substring(affectedNode.matchStartPos, affectedNode.matchEndPos + 1))
  const highlightWrapper = highlightWrapperNode.cloneNode(true)
  highlightWrapper.appendChild(matchNode)
  newNodes.push(highlightWrapper)
  updateCharPosToNodeMap(charPosToNodeMap, affectedNode.startIndex + affectedNode.matchStartPos, matchNode)

  // Post-match
  if (affectedNode.matchEndPos !== affectedNode.length() - 1) {
    const postMatchNode = document.createTextNode(text.substring(affectedNode.matchEndPos + 1, affectedNode.length()))
    newNodes.push(postMatchNode)
    updateCharPosToNodeMap(charPosToNodeMap, affectedNode.startIndex + affectedNode.matchEndPos + 1, postMatchNode)
  }

  // Replace old node with highlighted nodes
  const parent = affectedNode.node.parentNode
  const fragment = document.createDocumentFragment()
  newNodes.forEach(node => fragment.appendChild(node))
  parent.insertBefore(fragment, affectedNode.node)
  parent.removeChild(affectedNode.node)
}


function findNodesOfMatch(startPos, endPos, charPosToNodeMap, match) {
  let currentIndex = startPos
  const affectedNodes = []
  while (currentIndex <= endPos) {
    const nodeMatchInfo = new NodeMatchInfo(currentIndex, charPosToNodeMap, endPos, match)
    currentIndex = nodeMatchInfo.endIndex + 1
    affectedNodes.push(nodeMatchInfo)
  }
  return affectedNodes
}

function buildTextToNodeMap(node) {
  // Each element is a Node or a number referencing a previous node
  const charPosToNodeMap = []
  let fullText = ''

  function updateMap(node) {
    if (node.nodeType !== 3) {
      return // No text node
    }
    const nodeText = node.data
    if (nodeText.length === 0)
      return

    // Add text to fullText
    fullText += nodeText

    // First char is node
    charPosToNodeMap.push(node)
    const posOfNode = charPosToNodeMap.length - 1

    for (let i = 1; i < nodeText.length; i++) {
      charPosToNodeMap.push(posOfNode)
    }

    if (fullText.length !== charPosToNodeMap.length)
      throw new Error('fullText and charPosToNodeMap out of sync')
  }

  walkDOM(node, updateMap)

  return {
    fullText,
    charPosToNodeMap
  }
}

function createElementFromHTML(htmlString) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return tempDiv.firstChild;
}

class NodeMatchInfo {
  constructor(currentIndex, charPosToNodeMap, endPos, match) {
    this.node = charPosToNodeMap[currentIndex]
    this.startIndex = currentIndex
    this.endIndex = currentIndex
    this.matchStartPos = 0
    this.matchEndPos = 0
    if (Number.isInteger(this.node)) {
      // Node doesn't start here,
      this.startIndex = this.node
      this.node = charPosToNodeMap[this.node]
      this.matchStartPos = currentIndex - this.startIndex
    }
    this.endIndex = this.startIndex + this.length() - 1
    // Match ends inside node
    if (this.endIndex > endPos) {
      this.matchEndPos = this.matchStartPos + match.length - 1
    }
    // Match ends outside of node
    else {
      this.matchEndPos = this.length() - 1
    }
  }

  text() {
    return this.node.data
  }

  length() {
    return this.node.data.length
  }
}