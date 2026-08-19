#!/usr/bin/env bash
# ============================================================
#  extract-frames.sh — estrae i frame di un video al frame rate
#  originale (o a un fps scelto) e genera frames.html:
#  un sito scroll-scrubbing basato su immagini, che funziona
#  ovunque (anche su iPad e dispositivi vecchi).
#
#  Uso:
#    ./extract-frames.sh video.mp4
#    ./extract-frames.sh video.mp4 24        (forza 24 fps)
# ============================================================
set -euo pipefail

VIDEO="${1:-video.mp4}"
FPS_OPT="${2:-}"            # fps opzionale
OUT="frames"                # cartella dei frame
PAD=5                       # padding nome file (frame_00001.jpg)

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "❌ ERRORE: ffmpeg/ffprobe non trovati. Installali con: sudo apt install ffmpeg" >&2
  exit 1
fi
[ -f "$VIDEO" ] || { echo "❌ ERRORE: \"$VIDEO\" non esiste. Passa il percorso del video." >&2; exit 1; }

# --- fps originale ---
ORIG=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate \
        -of csv=p=0 "$VIDEO")
echo "ℹ️  Frame rate originale: $ORIG fps"

mkdir -p "$OUT"
rm -f "$OUT"/frame_*.jpg

echo "▶️  Estrazione frame da \"$VIDEO\" ..."
if [ -n "$FPS_OPT" ]; then
  ffmpeg -y -i "$VIDEO" -vf "fps=$FPS_OPT" -q:v 2 "$OUT/frame_%0${PAD}d.jpg" \
         -hide_banner -loglevel error
else
  ffmpeg -y -i "$VIDEO" -q:v 2 "$OUT/frame_%0${PAD}d.jpg" -hide_banner -loglevel error
fi

COUNT=$(find "$OUT" -name 'frame_*.jpg' | wc -l)
[ "$COUNT" -gt 0 ] || { echo "❌ Nessun frame estratto." >&2; exit 1; }
echo "✔️  Estratti $COUNT frame in $OUT/"

# ============================================================
#  Genera frames.html
# ============================================================
cat > frames.html <<'HTML'
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#05070a">
<title>Frames — scroll player</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#05070a;height:100%}
  body{overscroll-behavior-y:none;touch-action:pan-y}
  #stage{position:fixed;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;background:#05070a}
  #screen{max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;background:#05070a;display:block}
  #track{width:1px;height:100vh;pointer-events:none}
</style>
</head>
<body>
  <div id="stage">
    <img id="screen" alt="">
  </div>
  <div id="track"></div>
<script>
(function(){
  'use strict';
  var COUNT = __FRAME_COUNT__;      // riempito da extract-frames.sh
  var PAD   = 5;
  var $ = function(s){ return document.querySelector(s); };
  var img = $('#screen'), track = $('#track');

  var cache = [];
  var cur = -1;
  var pxPerFrame = 24;

  function name(i){
    var n = String(i+1);
    while (n.length < PAD) n = '0' + n;
    return 'frames/frame_' + n + '.jpg';
  }
  function show(i){
    i = Math.max(0, Math.min(COUNT-1, i));
    if (i === cur) return;
    cur = i;
    img.src = name(i);
    preload(i+1); preload(i-1);
  }
  function preload(i){
    if (i < 0 || i >= COUNT || cache[i]) return;
    cache[i] = new Image();
    cache[i].src = name(i);
  }
  function progress(){
    var max = track.offsetHeight - window.innerHeight;
    if (max <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / max));
  }
  document.addEventListener('scroll', function(){
    show(Math.floor(progress() * COUNT));
  }, {passive:true});
  window.addEventListener('resize', function(){ track.style.height = Math.max(COUNT*pxPerFrame, window.innerHeight*2) + 'px'; });

  // avvio
  track.style.height = Math.max(COUNT*pxPerFrame, window.innerHeight*2) + 'px';
  show(0);
  preload(1);
})();
</script>
</body>
</html>
HTML

sed -i "s/__FRAME_COUNT__/$COUNT/g" frames.html

echo "✔️  Creato frames.html — aprilo nel browser e scorri: il video scorre frame per frame."
echo "    (ricorda di tenere insieme frames.html e la cartella $OUT/)"
