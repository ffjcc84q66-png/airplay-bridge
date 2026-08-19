#!/usr/bin/env node
// ============================================================
//  build-single-file.js — crea scroll-player.html
//
//  Un UNICO file HTML con il video INCORPORATO dentro (base64).
//  Aprendolo non devi fare nulla: il video è già lì, scorri e
//  avanza frame per frame. Funziona anche su iPad, offline.
//
//  Uso:
//    node build-single-file.js
// ============================================================
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SRC    = 'index.html';       // player base
const VIDEO  = 'video.mp4';        // video sorgente
const TMP    = path.join('/tmp', 'scroll_player_embedded.mp4');
const OUT    = 'scroll-player.html';

if (!fs.existsSync(VIDEO)) {
  console.error('❌ ' + VIDEO + ' non trovato. Metti il video accanto allo script.');
  process.exit(1);
}
if (!fs.existsSync(SRC)) {
  console.error('❌ ' + SRC + ' non trovato.');
  process.exit(1);
}

// 1) Compatta il video (qualità buona, file piccolo e sicuro per iOS)
console.log('▶️  Compattazione video per l\'incorporamento...');
execFileSync('ffmpeg', [
  '-y', '-i', VIDEO,
  '-c:v', 'libx264', '-crf', '26', '-preset', 'medium',
  '-movflags', '+faststart',
  '-an',
  TMP
], { stdio: 'inherit' });

const b64     = fs.readFileSync(TMP).toString('base64');
const dataUri = 'data:video/mp4;base64,' + b64;
const vidMB   = (b64.length / 1048576).toFixed(1);

// 2) Leggi il player e sostituisci l'avvio
let html = fs.readFileSync(SRC, 'utf8');

const MARK  = 'resizeCanvas();\n  tryAutoLoad();';
const NEW   = 'resizeCanvas();\n  loadUrl("' + dataUri + '");';

if (!html.includes(MARK)) {
  console.error('❌ Marcatore di avvio non trovato in ' + SRC + '. Il player è cambiato?');
  process.exit(1);
}
html = html.replace(MARK, NEW);

// 4) Salva
fs.writeFileSync(OUT, html);
const outMB = (fs.statSync(OUT).size / 1048576).toFixed(1);
console.log('✔️  Creato ' + OUT + ' (' + outMB + ' MB — video incorporato: ' + vidMB + ' MB)');
console.log('   Aprilo nel browser e scorri: nessuna configurazione richiesta.');
