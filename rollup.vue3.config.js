import vue from 'rollup-plugin-vue-v3'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'vue3/src/WaterfallComponent.vue',
  output: [
    { file: 'vue3/dist/index.js', format: 'cjs' },
    { file: 'vue3/dist/index.esm.js', format: 'esm' }
  ],
  plugins: [
    vue({ css: true, compileTemplate: true }),
    postcss({ extract: true }),
    typescript({ tsconfig: false, include: ['shared/**/*.ts'], compilerOptions: { target: 'es2018', lib: ['es2018','dom'] } }),
    resolve(),
    commonjs(),
    copy({
      targets: [
        { src: 'vue3/types/index.d.ts', dest: 'vue3/dist' }
      ]
    })
  ],
  external: ['vue']
})