const EXCLUDES = ['HTML', 'NOSCRIPT', 'HEAD', 'STYLE', 'TITLE', 'LINK', 'SCRIPT', 'OBJECT', 'IFRAME']

export function regexHighlight(highlightConfigs, searchNode) {
  searchNode = searchNode || document.body

  const highlightFunction = createHighlightFunction(highlightConfigs)

  walkDOM(searchNode, highlightFunction)
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
    const posOfNode = charPosToNodeMap.length -1

    for(let i = 1; i < nodeText.length; i++) {
      charPosToNodeMap.push(posOfNode)
    }

    if (fullText.length !== charPosToNodeMap.length)
      throw new Error('fullText and charPosToNodeMap out of sync')
  }

  walkDOM(node, updateMap)


  console.log(fullText)
  console.log(charPosToNodeMap)
  console.log(node.textContent)
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

function getReplaceMatchFn(color) {
  return (match) => {
    return `<span class="ext-rex-highlighted-text" style="background-color: ${color}">${match}</span>`
  }
}

function getFragmetWithMatchesHighlighted(html, config) {
  // Checkout string.replace docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
  html = html.replace(config.regEx, function (match, ...rest) {
    const replaceMatch = getReplaceMatchFn(config.color)
    const [fullText, matchPos] = [rest.pop(), rest.pop()]
    if (rest.length > 0) {
      // Highlight every group
      let result = match
      while(rest.length > 0) {
        result = result.replace(rest.pop(), replaceMatch)
      }
      return result;
    } else {
      // Highlight match
      return replaceMatch(match)
    }
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
