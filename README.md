## Use-Jsx

English|[简体中文](https://github.com/Jcanno/use-jsx/blob/master/README.zh-CN.md)

use-jsx can help you use jsx with babel in native JS environment.

## How to use

1. type commands in terminal to install use-jsx:

```shell
# with npm
npm install use-jsx

# with yarn
yarn add use-jsx
```

2. config babel

`use-jsx` supports manual import and auto import babel config mode.

- import jsx in manual:

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

  import `use-jsx` in your source code:

  ```js
  import * as X from 'use-jsx'
  ```

  X needs to be consistent with your babel config.

- import jsx in automatic mode:

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

  You don't need import use-jsx anymore, it's all done by babel.

3. render your jsx

use `render` to generate Actual DOM to HTML page.

```jsx
import { render } from 'use-jsx'

render(<div>It's generated by use-jsx</div>, document.body, 'greeting')

// use-jsx support to render function which returns jsx
render(
  <MyComponent customProprs={myProps}></MyComponent>,
  document.getElementById('myDiv'),
  'myComponent',
)
```

render receives three arguments, first for custom jsx or function which returns jsx, second for real element which jsx mouted, the last is namespace for tree, `default` by default
