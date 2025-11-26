#!/usr/bin/env node

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

console.log('Building packages...');
execSync('npm run build', { stdio: 'inherit' });

// Create dist directories if they don't exist
const vue3DistDir = resolve('examples/vue3/dist');
const vue2DistDir = resolve('examples/vue2/dist');

if (!existsSync(vue3DistDir)) {
  mkdirSync(vue3DistDir, { recursive: true });
}

if (!existsSync(vue2DistDir)) {
  mkdirSync(vue2DistDir, { recursive: true });
}

// Copy Vue3 dist files
console.log('Copying Vue3 dist files...');
const vue3Files = [
  'vue3/dist/index.esm.js',
  'vue3/dist/index.esm.css',
  'vue3/dist/index.js',
  'vue3/dist/index.css'
];

vue3Files.forEach(file => {
  const source = resolve(file);
  const dest = resolve('examples', file);
  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log(`Copied ${file} to examples/${file}`);
  }
});

// Copy Vue2 dist files
console.log('Copying Vue2 dist files...');
const vue2Files = [
  'vue2/dist/index.esm.js',
  'vue2/dist/index.esm.css',
  'vue2/dist/index.js',
  'vue2/dist/index.css',
  'vue2/dist/index.umd.js'
];

vue2Files.forEach(file => {
  const source = resolve(file);
  const dest = resolve('examples', file);
  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log(`Copied ${file} to examples/${file}`);
  }
});

console.log('Build and copy completed successfully!');