// Copies Skia's CanvasKit wasm into public/ so the web build can load charts.
// Runs on install; the file is not committed.
const fs = require('fs');
const path = require('path');

const source = require.resolve('canvaskit-wasm/bin/full/canvaskit.wasm');
const target = path.join(__dirname, '..', 'public', 'canvaskit.wasm');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
