#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const REF_DIR = path.join(PUBLIC_DIR, 'references');
const MANIFEST = path.join(REF_DIR, 'manifest.json');

let timer = null;
function debounceRun() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const proc = spawn(process.execPath, [path.resolve(__dirname, 'generate-references-manifest.js')], {
      stdio: 'inherit'
    });
    proc.on('exit', (code) => {
      // noop
    });
  }, 200);
}

function start() {
  if (!fs.existsSync(REF_DIR)) {
    console.error('references directory not found:', REF_DIR);
    process.exit(0);
  }
  // initial generate
  debounceRun();
  try {
    const watcher = fs.watch(REF_DIR, { persistent: true }, (eventType, filename) => {
      if (!filename) return;
      if (filename.toString() === 'manifest.json') return; // ignore self
      debounceRun();
    });
    process.on('SIGINT', () => { watcher.close(); process.exit(0); });
    process.on('SIGTERM', () => { watcher.close(); process.exit(0); });
  } catch (e) {
    console.error('watch failed:', e.message);
    process.exit(1);
  }
}

start();
