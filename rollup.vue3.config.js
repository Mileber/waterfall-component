import vue from 'rollup-plugin-vue'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'vue3/index.js',
  output: [
    { file: 'vue3/dist/index.js', format: 'cjs' },
    { file: 'vue3/dist/index.esm.js', format: 'esm' }
  ],
  plugins: [
    vue({ css: true, compileTemplate: true }),
    postcss({ extract: true }),
    typescript({ tsconfig: false, include: ['shared/**/*.ts'], compilerOptions: { target: 'es2018', lib: ['es2018','dom'] } }),
    resolve(),
    commonjs()
  ],
  external: ['vue']
}