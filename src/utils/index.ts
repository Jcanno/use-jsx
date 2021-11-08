import { JSXNode } from '../index'
import { createSvgElement, isSvg } from './svg'

export const customHook = ['useDom']

export const isEvent = (key) => key.startsWith('on')
const isCustomHook = (key) => customHook.includes(key)
export const isProperty = (key) => key !== 'children' && !isEvent(key) && !isCustomHook(key)

const createTextElement = () => document.createTextNode('')

export const isSameNodeType = (newNode: JSXNode, oldNode: JSXNode) =>
  newNode && oldNode && newNode.type === oldNode.type

export const createDom = (node) => {
  const dom =
    node.type === 'TEXT_ELEMENT'
      ? createTextElement()
      : isSvg(node.type)
      ? createSvgElement(node.type)
      : document.createElement(node.type)

  Object.keys(node.props)
    .filter(isProperty)
    .forEach((name) => {
      if (name === 'style') {
        Object.keys(node.props[name] || {}).forEach((key) => {
          dom.style.setProperty(key, node.props[name][key])
        })
      } else {
        node.type === 'TEXT_ELEMENT'
          ? (dom[name] = node.props[name])
          : dom.setAttribute(name, node.props[name])
      }
    })

  Object.keys(node.props)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, node.props[name])
    })

  return dom
}

const isNew = (prev, next) => (key) => prev[key] !== next[key]
const isGone = (prev, next) => (key) => !(key in next) || next[key] === null
export const updateDom = (dom, prevProps, nextProps) => {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

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
    .filter(isNew(prevProps, nextProps))
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

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}

export const isFunctionComponent = (node: JSXNode) => node?.type instanceof Function
