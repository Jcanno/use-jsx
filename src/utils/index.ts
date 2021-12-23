import { JSXElement } from '../index'
import { createSvgElement, isSvg } from './svg'

export const customHook = ['useDom']

export const isEvent = (key) => key.startsWith('on')
const isCustomHook = (key) => customHook.includes(key)
export const isProperty = (key) => key !== 'children' && !isEvent(key) && !isCustomHook(key)

const createTextElement = (textDom: Text, element: JSXElement) => {
  textDom = textDom ? textDom : document.createTextNode('')

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      textDom[name] = element.props[name]
    })

  return textDom
}
const createElement = (tag: string) => document.createElement(tag)
const setStyle = (element: JSXElement, dom) => {
  Object.keys(element.props.style || {}).forEach((key) => {
    ;(dom as SVGAElement | HTMLElement).style.setProperty(key, element.props.style[key])
  })
}
export const isSameElementType = (newElement: JSXElement, oldElement: JSXElement) =>
  newElement && oldElement && newElement.type === oldElement.type

export const createDom = (element: JSXElement) => {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? createTextElement(null, element)
      : isSvg(element.type as string)
      ? createSvgElement(element.type as string)
      : createElement(element.type as string)

  if (element.type !== 'TEXT_ELEMENT') {
    Object.keys(element.props)
      .filter((k) => !isCustomHook(k))
      .forEach((name) => {
        if (isEvent(name)) {
          const eventType = name.toLowerCase().substring(2)
          dom.addEventListener(eventType, element.props[name])
        } else if (name === 'style') {
          setStyle(element, dom)
        } else if (isProperty(name)) {
          ;(dom as SVGAElement | HTMLElement).setAttribute(name, element.props[name])
        }
      })
  }

  return dom
}

const isNotEqual = (prev, next) => (key) => prev[key] !== next[key]
const isGone = (prev, next) => (key) => !(key in next) || next[key] === null
const updateEvents = (dom, prevProps, nextProps) => {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => isGone(prevProps, nextProps)(key) || isNotEqual(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNotEqual(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}

const updateProperties = (dom, prevProps, nextProps) => {
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'style') {
        Object.keys(prevProps[name] || {}).forEach((key) => {
          dom.style.removeProperty(key)
        })
      } else {
        dom.setAttribute ? dom.setAttribute(name, '') : (dom[name] = '')
      }
    })

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNotEqual(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'style') {
        Object.keys(prevProps[name] || {})
          .filter((key) => !(key in (nextProps[name] || {})))
          .forEach((key) => {
            dom.style.removeProperty(key)
          })
        Object.keys(nextProps[name] || {}).forEach((key) => {
          dom.style.setProperty(key, nextProps[name][key])
        })
      } else {
        dom.setAttribute ? dom.setAttribute(name, nextProps[name]) : (dom[name] = nextProps[name])
      }
    })
}
export const updateDom = (dom, prevProps, nextProps) => {
  updateEvents(dom, prevProps, nextProps)
  updateProperties(dom, prevProps, nextProps)
}

export const isObject = (target) => typeof target === 'object' && target !== null

export const isArray = (target) => Array.isArray(target)

export const isFunctionComponent = (element: JSXElement) => element?.type instanceof Function
