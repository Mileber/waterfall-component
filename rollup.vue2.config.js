import vue from 'rollup-plugin-vue-v2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'vue2/index.js',
  output: [
    { file: 'vue2/dist/index.js', format: 'cjs' },
    { file: 'vue2/dist/index.esm.js', format: 'esm' },
    { 
      file: 'vue2/dist/index.umd.js', 
      format: 'umd', 
      name: 'WaterfallComponent',
      globals: {
        vue: 'Vue'
      }
    }
  ],
  plugins: [
    vue({ css: true, compileTemplate: true }),
    postcss({ extract: true }),
    typescript({ tsconfig: false, include: ['shared/**/*.ts'], exclude: ['tests/**/*.ts'], compilerOptions: { target: 'es2018', lib: ['es2018','dom'] } }),
    resolve(),
    commonjs()
  ],
  external: ['vue']
}