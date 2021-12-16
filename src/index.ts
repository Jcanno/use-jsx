import { createDom, customHook, isFunctionComponent, isSameElementType, updateDom } from './utils'

export type JSXElement = {
  type?: string | ((...args: any[]) => any) | typeof Fragment
  props: Record<string, any>
  dom: HTMLElement | SVGElement | Text | DocumentFragment
  functionChild?: JSXElement
  fragmentChild?: JSXElement
}

type JSXElementTree = {
  [key: string]: {
    old: JSXElement
    new: JSXElement
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

const jsxElementTreeMap: JSXElementTree = {}

const render = (element, container, namespace = 'default') => {
  const jSXElementTree = jsxElementTreeMap[namespace]
    ? (jsxElementTreeMap[namespace] = {
        new: element,
        old: jsxElementTreeMap[namespace].new,
      })
    : (jsxElementTreeMap[namespace] = {
        new: element,
        old: null,
      })

  traverseDom(jSXElementTree.new, jSXElementTree.old, container)
}

const hookForDom = (element: JSXElement) => {
  customHook.forEach((hook) => {
    const onHook = element.props[hook]
    if (onHook) {
      onHook(element.dom)
    }
  })
}

const compareNodeChildren = (newElement: JSXElement, oldElement: JSXElement) => {
  const newElementChildren: JSXElement[] = newElement?.props.children || []
  const oldElementChildren: JSXElement[] = oldElement?.props.children || []
  const compareLength =
    newElementChildren.length >= oldElementChildren.length
      ? newElementChildren.length
      : oldElementChildren.length
  for (let i = 0; i < compareLength; i++) {
    traverseDom(newElementChildren[i], oldElementChildren[i], newElement.dom)
  }
}

const createDomByElement = (newElement: JSXElement, parent: HTMLElement) => {
  const dom = createDom(newElement)
  newElement.dom = dom

  const { children = [] } = newElement.props

  for (const child of children) {
    traverseDom(child, null, dom)
  }

  hookForDom(newElement)
  parent.appendChild(dom)
}

const traverseDom = (newElement: JSXElement, oldElement: JSXElement, parent: JSXElement['dom']) => {
  if (newElement?.type === Fragment) {
    const fragment = document.createDocumentFragment()

    newElement.dom = fragment
    compareNodeChildren(newElement, oldElement)
    parent.appendChild(fragment)

    return
  }

  if (isFunctionComponent(newElement)) {
    const child = (newElement.type as (...args: any[]) => any)(newElement.props)

    newElement.functionChild = child
    traverseDom(child, oldElement?.functionChild, parent)
    return
  }

  if (newElement && !oldElement) {
    createDomByElement(newElement, parent as HTMLElement)
  } else if (!newElement && oldElement) {
    parent.removeChild(oldElement.dom)
  } else if (newElement && oldElement) {
    if (isSameElementType(newElement, oldElement)) {
      updateDom(oldElement.dom, oldElement.props, newElement.props)

      newElement.dom = oldElement.dom
      compareNodeChildren(newElement, oldElement)
      hookForDom(newElement)
    } else {
      parent.removeChild(oldElement.dom)
      createDomByElement(newElement, parent as HTMLElement)
    }
  }
}

export { createElement, render, Fragment }
