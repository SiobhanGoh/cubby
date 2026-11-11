// Bundles src/ into one self-contained page at docs/index.html (the folder GitHub Pages serves).
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const out = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false });
const js = out.outputFiles[0].text.replaceAll('</script', '<\\/script');
mkdirSync('docs', { recursive: true });
writeFileSync('docs/index.html', readFileSync('src/index.html', 'utf8').replace('/*BUNDLE*/', () => js));
console.log('built docs/index.html', Math.round(js.length / 1024) + ' KB');
