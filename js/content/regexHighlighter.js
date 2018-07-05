const EXCLUDES = ['HTML', 'NOSCRIPT', 'HEAD', 'STYLE', 'TITLE', 'LINK', 'SCRIPT', 'OBJECT', 'IFRAME']

export function regexHighlight(highlightConfigs, searchNode) {
  searchNode = searchNode || document.body

  const highlightFunction = createHighlightFunction(highlightConfigs)

  walkDOM(searchNode, highlightFunction)
}

function walkDOM(node, func) {
  let currentNode = node.firstChild
  func(node)

  while (currentNode) {
    if (!EXCLUDES.includes(currentNode.nodeName))
      walkDOM(currentNode, func)
    currentNode = currentNode.nextSibling
  }
}

function createHighlightFunction(highlightConfigs) {
  // Compile regex only once not for every node
  const activePrecompiledHighlightConfigs = highlightConfigs
    .filter(config => config.active && config.regEx !== '')
    .map(config => {
      // g - global, i - caseinsensitive, m - multiline search context
      return {
        regEx: new RegExp(config.regEx, 'gim'),
        color: config.color
      }
    })

  return (node) => highlightNode(node, activePrecompiledHighlightConfigs)
}

function highlightNode(node, highlighConfigList) {
  if (node.nodeType !== 3) {
    return // No text node
  }

  const parent = node.parentNode
  let html = node.data

  const matchingConfigs = highlighConfigList.filter(config => {
    config.regEx.lastIndex = 0    // Javascript magic https://stackoverflow.com/questions/2851308/why-does-my-javascript-regex-test-give-alternating-results
    return config.regEx.test(html)
  })
  if (matchingConfigs.length === 0) {
    return  // Do nothing
  }
  else {
    const currentConfig = matchingConfigs.shift()
    const fragment = getFragmetWithMatchesHighlighted(html, currentConfig);
    // Recurse on fragment if multiple configs matched
    if (matchingConfigs.length > 0) {
      walkDOM(fragment, (node) => {
        highlightNode(node, matchingConfigs)
      })
    }
    parent.insertBefore(fragment, node)
    parent.removeChild(node)
  }
}

function getFragmetWithMatchesHighlighted(html, config) {
  html = html.replace(config.regEx, function (match) {
    return `<span class="ext-rex-highlighted-text" style="background-color: ${config.color}">${match}</span>`
  })

  // Replace node with new html
  const fragment = (function () {
    const temporaryWrapper = document.createElement("div"),
      frag = document.createDocumentFragment()
    temporaryWrapper.innerHTML = html
    while (temporaryWrapper.firstChild) {
      frag.appendChild(temporaryWrapper.firstChild)
    }
    return frag
  })()
  return fragment
}
