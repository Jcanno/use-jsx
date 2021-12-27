## Use-Jsx

[English]|简体中文(https://github.com/Jcanno/use-jsx/blob/master/README.md)

use-jsx 可以结合 babel 在原生环境 使用 jsx

## 如何使用

1. 在终端敲入以下命令

```shell
# with npm
npm install use-jsx

# with yarn
yarn add use-jsx
```

2. 配置 babel

use-jsx 支持 babel 手动或者自动导入 jsx 两种模式配置

手动导入 jsx:

```js
{
  // 如果使用TypeScript，需要安装@babel/plugin-transform-typescript
  [
    '@babel/plugin-transform-typescript',
    {
      isTSX: true,
      // 配置X.createElement, X为自定义，需要与源码中一致
      jsxPragma: 'X.createElement',
      // 配置Fragment, X为自定义，需要与源码中一致
      jsxPragmaFrag: 'X.Fragment',
    },
  ],
  [
    '@babel/plugin-transform-react-jsx',
    {
      // 配置X.createElement, X为自定义，需要与源码中一致
      pragma: 'X.createElement',
      // 配置Fragment, X为自定义，需要与源码中一致
      pragmaFrag: 'X.Fragment',
    },
  ],
}
```

源码中引用 use-jsx:

```js
import * as X from 'use-jsx'
```

X 需要与 babel 配置中一致

自动导入 jsx:

```js
{
  plugins: [
    [
      // 如果使用TypeScript，需要安装@babel/plugin-transform-typescript
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

现在不用手动导入 jsx, babel 帮助我们完成了导入工作。