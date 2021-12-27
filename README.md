## Use-Jsx

English|[简体中文](https://github.com/Jcanno/use-jsx/blob/master/README-CH.md)

use-jsx can help you use jsx with babel in native JS env.

## 如何使用

1. type commands in terminal to instal use-jsx:

```shell
# with npm
npm install use-jsx

# with yarn
yarn add use-jsx
```

2. config babel

use-jsx support manual import and auto import babel config mode.

import jsx in manual:

```js
{
  // you need to install @babel/plugin-transform-typescript if you use TypeScript
  [
    '@babel/plugin-transform-typescript',
    {
      isTSX: true,
      // config X.createElement, X is customized, it's required to be the same in your source code.
      jsxPragma: 'X.createElement',
      // config X.Fragment, X is customized, it's required to be the same in your source code.
      jsxPragmaFrag: 'X.Fragment',
    },
  ],
  [
    '@babel/plugin-transform-react-jsx',
    {
      // config X.createElement, X is customized, it's required to be the same in your source code.
      pragma: 'X.createElement',
      // config X.Fragment, X is customized, it's required to be the same in your source code.
      pragmaFrag: 'X.Fragment',
    },
  ],
}
```

import use-jsx in your source code:

```js
import * as X from 'use-jsx'
```

X need consistent with your babel config.

import jsx in automatic mode:

```js
{
  plugins: [
    [
      // you need to install @babel/plugin-transform-typescript if you use TypeScript
      '@babel/plugin-transform-typescript',
      {
        isTSX: true,
      },
    ],
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
        importSource: 'use-jsx',
      },
    ],
  ]
}
```

You need't import use-jsx, it's done by babel.
