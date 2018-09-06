const EXCLUDES = ['HTML', 'NOSCRIPT', 'HEAD', 'STYLE', 'TITLE', 'LINK', 'SCRIPT', 'OBJECT', 'IFRAME']

// TODO: Allow nested collapse blocks?
export function collapseText(collapseConfig, searchNode) {
  if (!collapseConfig.active || collapseConfig.startRegEx === '' || collapseConfig.stopRegEx === '')
    return
  searchNode = searchNode || document.body
  const collapseFn = (nodes) => {
    collapseTextNodes(collapseConfig, nodes)
  }
  walkDOMofTextNodes(searchNode, collapseFn)
}

function walkDOMofTextNodes(node, func) {
  let currentNode = node.firstChild
  while (currentNode) {
    // Group text nodes next to each other
    if (currentNode.nodeType === 3) {
      // Check for text siblings
      const textNodes = []

      while (currentNode && currentNode.nodeType === 3) {
        textNodes.push(currentNode)
        currentNode = currentNode.nextSibling
      }
      func(textNodes)
      if (currentNode === null)
        continue
    }
    // Non text node => recur
    const nodeNotExcluded = !EXCLUDES.includes(currentNode.nodeName)
    const isNoCollapsable = !currentNode.classList || !currentNode.classList.contains("hc-collapsed")
    if (nodeNotExcluded && isNoCollapsable)
      walkDOMofTextNodes(currentNode, func)
    currentNode = currentNode.nextSibling
  }
}

function collapseTextNodes(collapseConfig, nodes) {
  const text = nodes.map(node => node.data).join('\n')
  const regex = new RegExp(collapseConfig.startRegEx + "((?:.|\n)*?)" + collapseConfig.stopRegEx, "gi");

  if (regex.test(text)) {
    const firstNode = nodes[0]
    const parent = firstNode.parentNode
    const fragment = getFragmetWithCollapsedText(text, collapseConfig)
    // Add click listener
    fragment.querySelectorAll('div.hc-collapse-header').forEach(headerElement => {
      headerElement.addEventListener('click', toggleCollapse)
    })
    // Insert fragment before first node and then remove all text nodes
    parent.insertBefore(fragment, firstNode)
    nodes.forEach(node => parent.removeChild(node))
  }
}

function toggleCollapse(event) {
  const header = this
  const body = this.nextElementSibling
  if (!body.classList.contains("hidden")) {
    body.classList.add('hidden');
  } else {
    body.classList.remove('hidden');
  }

}

function getFragmetWithCollapsedText(text, config) {
  const regex = new RegExp(config.startRegEx + "((?:.|\n)*?)" + config.stopRegEx, "g");
  const html = text.replace(regex, function (match) {
    return createCollapseBlock(config.title, match, config.color);
  });

  // Create fragment with html
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

const createCollapseBlock = function (title, body, color) {
  // No whitespaces to avoid layout issues in pre elements
  let element = `<div class="hc-collapsed" style="background-color: ${color}"><div class="hc-collapse-header">${title}</div><div class="hc-collapse-body hidden">${body}</div></div>`
  return element
};