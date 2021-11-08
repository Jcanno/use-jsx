import { createDom, customHook, isFunctionComponent, isSameNodeType, updateDom } from './utils'

export type JSXNode = {
  type?: string | ((...args: any[]) => any) | typeof Fragment
  props: Record<string, any>
  dom: HTMLElement | DocumentFragment
  functionChild?: JSXNode
  fragmentChild?: JSXNode
}

type JSXDomTree = {
  [key: string]: {
    old: JSXNode
    new: JSXNode
  }
}

const Fragment = Symbol('fragment')

const createElement = (type: string, props: Record<string, any> = {}, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  }
}

const createTextElement = (text: string) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

const jsxDomTreeMap: JSXDomTree = {}

const render = (element, container, namespace = 'default') => {
  const jsxDomTree = jsxDomTreeMap[namespace]
    ? (jsxDomTreeMap[namespace] = {
        new: element,
        old: jsxDomTreeMap[namespace].new,
      })
    : (jsxDomTreeMap[namespace] = {
        new: element,
        old: null,
      })

  traverseDom(jsxDomTree.new, jsxDomTree.old, container)
}

const hookForDom = (node: JSXNode) => {
  customHook.forEach((hook) => {
    const onHook = node.props[hook]
    if (onHook) {
      onHook(node.dom)
    }
  })
}

const compareNodeChildren = (newNode: JSXNode, oldNode: JSXNode) => {
  const newNodeChildren: JSXNode[] = newNode?.props.children || []
  const oldNodeChildren: JSXNode[] = oldNode?.props.children || []
  const newNodeChildrenMoreThanOld = newNodeChildren.length >= oldNodeChildren.length
  for (
    let i = 0;
    i < (newNodeChildrenMoreThanOld ? newNodeChildren : oldNodeChildren).length;
    i++
  ) {
    traverseDom(newNodeChildren[i], oldNodeChildren[i], newNode.dom)
  }
}

const createDomByNode = (newNode: JSXNode, parent: HTMLElement) => {
  const dom = createDom(newNode)
  newNode.dom = dom

  const { children = [] } = newNode.props

  for (const child of children) {
    traverseDom(child, null, dom)
  }

  hookForDom(newNode)
  parent.appendChild(dom)
}

const traverseDom = (
  newNode: JSXNode,
  oldNode: JSXNode,
  parent: HTMLElement | DocumentFragment,
) => {
  if (newNode?.type === Fragment) {
    const fragment = document.createDocumentFragment()

    newNode.dom = fragment
    compareNodeChildren(newNode, oldNode)
    parent.appendChild(fragment)

    return
  }

  if (isFunctionComponent(newNode)) {
    const child = (newNode.type as (...args: any[]) => any)(newNode.props)

    newNode.functionChild = child
    traverseDom(child, oldNode?.functionChild, parent)
    return
  }

  if (newNode && !oldNode) {
    createDomByNode(newNode, parent as HTMLElement)
  } else if (!newNode && oldNode) {
    parent.removeChild(oldNode.dom)
  } else if (newNode && oldNode) {
    if (isSameNodeType(newNode, oldNode)) {
      updateDom(oldNode.dom, oldNode.props, newNode.props)

      newNode.dom = oldNode.dom
      compareNodeChildren(newNode, oldNode)
      hookForDom(newNode)
    } else {
      parent.removeChild(oldNode.dom)
      createDomByNode(newNode, parent as HTMLElement)
    }
  }
}

export { createElement, render, Fragment }
