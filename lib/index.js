'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var svgTags = [
    'animate',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    '',
    'svg',
    'rect',
    'mask',
    'path',
];
var isSvg = function (tag) { return svgTags.includes(tag); };
var createSvgElement = function (tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
};

var customHook = ['useDom'];
var isEvent = function (key) { return key.startsWith('on'); };
var isCustomHook = function (key) { return customHook.includes(key); };
var isProperty = function (key) { return key !== 'children' && !isEvent(key) && !isCustomHook(key); };
var createTextElement$1 = function () { return document.createTextNode(''); };
var isSameNodeType = function (newNode, oldNode) {
    return newNode && oldNode && newNode.type === oldNode.type;
};
var createDom = function (node) {
    var dom = node.type === 'TEXT_ELEMENT'
        ? createTextElement$1()
        : isSvg(node.type)
            ? createSvgElement(node.type)
            : document.createElement(node.type);
    Object.keys(node.props)
        .filter(isProperty)
        .forEach(function (name) {
        if (name === 'style') {
            Object.keys(node.props[name] || {}).forEach(function (key) {
                dom.style.setProperty(key, node.props[name][key]);
            });
        }
        else {
            node.type === 'TEXT_ELEMENT'
                ? (dom[name] = node.props[name])
                : dom.setAttribute(name, node.props[name]);
        }
    });
    Object.keys(node.props)
        .filter(isEvent)
        .forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, node.props[name]);
    });
    return dom;
};
var isNew = function (prev, next) { return function (key) { return prev[key] !== next[key]; }; };
var isGone = function (prev, next) { return function (key) { return !(key in next) || next[key] === null; }; };
var updateDom = function (dom, prevProps, nextProps) {
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(function (key) { return !(key in nextProps) || isNew(prevProps, nextProps)(key); })
        .forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
    });
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(function (name) {
        if (name === 'style') {
            Object.keys(prevProps[name] || {}).forEach(function (key) {
                dom.style.removeProperty(key);
            });
        }
        else {
            dom.setAttribute ? dom.setAttribute(name, '') : (dom[name] = '');
        }
    });
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(function (name) {
        if (name === 'style') {
            Object.keys(prevProps[name] || {})
                .filter(function (key) { return !(key in (nextProps[name] || {})); })
                .forEach(function (key) {
                dom.style.removeProperty(key);
            });
            Object.keys(nextProps[name] || {}).forEach(function (key) {
                dom.style.setProperty(key, nextProps[name][key]);
            });
        }
        else {
            dom.setAttribute ? dom.setAttribute(name, nextProps[name]) : (dom[name] = nextProps[name]);
        }
    });
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
    });
};
var isFunctionComponent = function (node) { return (node === null || node === void 0 ? void 0 : node.type) instanceof Function; };

var Fragment = Symbol('fragment');
var createElement = function (type, props) {
    if (props === void 0) { props = {}; }
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return {
        type: type,
        props: __assign(__assign({}, props), { children: children.map(function (child) {
                return typeof child === 'object' ? child : createTextElement(child);
            }) }),
    };
};
var createTextElement = function (text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        },
    };
};
var jsxDomTreeMap = {};
var render = function (element, container, namespace) {
    if (namespace === void 0) { namespace = 'default'; }
    var jsxDomTree = jsxDomTreeMap[namespace]
        ? (jsxDomTreeMap[namespace] = {
            new: element,
            old: jsxDomTreeMap[namespace].new,
        })
        : (jsxDomTreeMap[namespace] = {
            new: element,
            old: null,
        });
    traverseDom(jsxDomTree.new, jsxDomTree.old, container);
};
var hookForDom = function (node) {
    customHook.forEach(function (hook) {
        var onHook = node.props[hook];
        if (onHook) {
            onHook(node.dom);
        }
    });
};
var compareNewOldChildren = function (newNode, oldNode) {
    var newNodeChildren = newNode.props.children || [];
    var oldNodeChildren = oldNode.props.children || [];
    var newNodeChildrenMoreThanOld = newNodeChildren.length >= oldNodeChildren.length;
    for (var i = 0; i < (newNodeChildrenMoreThanOld ? newNodeChildren : oldNodeChildren).length; i++) {
        traverseDom(newNodeChildren[i], oldNodeChildren[i], newNode.dom);
    }
};
var createDomByNode = function (newNode, parent) {
    var dom = createDom(newNode);
    newNode.dom = dom;
    var _a = newNode.props.children, children = _a === void 0 ? [] : _a;
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var child = children_1[_i];
        traverseDom(child, null, dom);
    }
    hookForDom(newNode);
    parent.appendChild(dom);
};
var traverseDom = function (newNode, oldNode, parent) {
    if ((newNode === null || newNode === void 0 ? void 0 : newNode.type) === Fragment) {
        var fragment = document.createDocumentFragment();
        compareNewOldChildren(newNode, oldNode);
        parent.appendChild(fragment);
        return;
    }
    if (isFunctionComponent(newNode)) {
        var child = newNode.type(newNode.props);
        newNode.functionChild = child;
        traverseDom(child, oldNode === null || oldNode === void 0 ? void 0 : oldNode.functionChild, parent);
        return;
    }
    if (newNode && !oldNode) {
        createDomByNode(newNode, parent);
    }
    else if (!newNode && oldNode) {
        parent.removeChild(oldNode.dom);
    }
    else if (newNode && oldNode) {
        if (isSameNodeType(newNode, oldNode)) {
            updateDom(oldNode.dom, oldNode.props, newNode.props);
            newNode.dom = oldNode.dom;
            compareNewOldChildren(newNode, oldNode);
            hookForDom(newNode);
        }
        else {
            parent.removeChild(oldNode.dom);
            createDomByNode(newNode, parent);
        }
    }
};

exports.Fragment = Fragment;
exports.createElement = createElement;
exports.render = render;
