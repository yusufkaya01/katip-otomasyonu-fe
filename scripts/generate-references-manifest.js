#!/usr/bin/env node
/*
  Scans public/references and writes public/references/manifest.json
  Each entry is {url, city, name}. Filenames are parsed as CITY_COMPANY.ext
*/
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const REF_DIR = path.join(PUBLIC_DIR, 'references');
const MANIFEST = path.join(REF_DIR, 'manifest.json');

function stripExt(name){
  return name.replace(/\.[^.]+$/, '');
}

function parseFile(file){
  const noExt = stripExt(file);
  const idx = noExt.indexOf('_');
  let city = '';
  let company = noExt;
  if (idx > -1) {
    city = noExt.slice(0, idx);
    company = noExt.slice(idx + 1);
  }
  return {
    url: `/references/${encodeURIComponent(file)}`,
    city,
    name: company,
  };
}

function main(){
  if (!fs.existsSync(REF_DIR)) {
    console.error('references directory not found:', REF_DIR);
    process.exit(0);
  }
  const files = fs.readdirSync(REF_DIR)
    .filter(f => /\.(png|jpe?g|svg|webp)$/i.test(f))
    .sort((a,b)=> a.localeCompare(b, 'tr'));
  const entries = files.map(parseFile);
  if (!fs.existsSync(REF_DIR)) fs.mkdirSync(REF_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`Wrote ${entries.length} references to`, MANIFEST);
}

main();
