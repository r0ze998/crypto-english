// dist-artifact/index.html（1ファイル版）を Artifact の形式に変換する:
// <html>/<head>/<body> を外し、<title>・<style>・本文・<script> だけを残す。
import fs from 'node:fs';

const [, , src = 'dist-artifact/index.html', out = 'dist-artifact/crypto-english.html'] = process.argv;
const html = fs.readFileSync(src, 'utf8');
const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]);
const scripts = [...html.matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]);
const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
const page = [
  '<title>Crypto English</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<meta name="theme-color" content="#0f1720">',
  ...styles,
  body.trim(),
  ...scripts,
].join('\n');
fs.writeFileSync(out, page);
console.log(`${out}: ${(page.length / 1024).toFixed(0)} KB`);
