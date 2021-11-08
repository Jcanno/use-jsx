import { defineConfig } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default defineConfig({
  input: 'src/index.ts',
  output: [
    { file: 'es/index.js', format: 'esm' },
    { file: 'lib/index.js', format: 'cjs' },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      useTsconfigDeclarationDir: true,
    }),
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
      format: {
        comments: RegExp(`${pkg.name}`),
      },
    }),
  ],
})
