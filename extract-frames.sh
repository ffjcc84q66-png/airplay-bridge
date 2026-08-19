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
  html,body{background:#05070a;color:#eef1f6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
  body{overscroll-behavior-y:none;touch-action:pan-y}
  #stage{position:fixed;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;background:#05070a}
  #screen{max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;background:#05070a;display:block}
  .hud{position:absolute;z-index:6;color:#eef1f6;font-size:13px;user-select:none;-webkit-user-select:none}
  #hint{top:max(16px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:rgba(13,16,22,.78);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:10px 18px;border-radius:999px;font-weight:600;animation:pulse 2.6s ease-in-out infinite;transition:opacity .5s}
  #hint.hidden{opacity:0;pointer-events:none}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
  #progWrap{bottom:calc(24px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(720px,calc(100vw - 32px));display:flex;align-items:center;gap:12px}
  #progBar{flex:1;height:5px;border-radius:99px;background:rgba(255,255,255,.16);cursor:pointer;position:relative;touch-action:none}
  #progFill{position:absolute;inset:0 auto 0 0;width:0%;background:#6ea8ff;border-radius:99px}
  #progKnob{position:absolute;top:50%;left:0%;width:15px;height:15px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);box-shadow:0 1px 6px rgba(0,0,0,.5)}
  #info{bottom:calc(20px + env(safe-area-inset-bottom));right:16px;font-variant-numeric:tabular-nums;color:#9aa3b2;text-align:right;font-size:12px;pointer-events:none}
  #info b{color:#eef1f6;font-size:13px}
  #settings{position:absolute;z-index:7;right:16px;bottom:calc(72px + env(safe-area-inset-bottom));width:min(300px,calc(100vw - 32px));background:rgba(13,16,22,.78);border:1px solid rgba(255,255,255,.12);border-radius:16px;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);padding:16px;display:none;flex-direction:column;gap:14px;font-size:13px}
  #settings.open{display:flex}
  .row{display:flex;flex-direction:column;gap:6px}
  .row label{color:#9aa3b2;display:flex;justify-content:space-between;align-items:center}
  .row label output{color:#eef1f6}
  input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:99px;background:rgba(255,255,255,.18);outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:#6ea8ff;cursor:pointer}
  #track{width:1px;height:100vh;pointer-events:none}
  #tools{top:max(16px,env(safe-area-inset-top));right:16px;display:flex;gap:8px}
  .iconbtn{appearance:none;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(13,16,22,.78);color:#eef1f6;width:42px;height:42px;font-size:18px;cursor:pointer;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
  .iconbtn:hover{background:rgba(255,255,255,.14)}
</style>
</head>
<body>
  <div id="stage">
    <img id="screen" alt="">
    <div class="hud" id="hint">⬇️ Scorri per riprodurre</div>
    <div class="hud" id="tools">
      <button class="iconbtn" id="settingsBtn" title="Impostazioni">⚙️</button>
    </div>
    <div class="hud" id="progWrap"><div id="progBar"><div id="progFill"></div><div id="progKnob"></div></div></div>
    <div class="hud" id="info"><b>—</b><br>—</div>
    <div id="settings">
      <div class="row">
        <label for="speed">Px per frame <output id="speedVal"></output></label>
        <input type="range" id="speed" min="2" max="200" step="1" value="24">
      </div>
    </div>
  </div>
  <div id="track"></div>
<script>
(function(){
  'use strict';
  var COUNT = __FRAME_COUNT__;      // riempito da extract-frames.sh
  var PAD   = 5;
  var $ = function(s){ return document.querySelector(s); };
  var img = $('#screen'), track = $('#track'), info = $('#info');
  var progBar = $('#progBar'), progFill = $('#progFill'), progKnob = $('#progKnob');

  var cache = [];
  var cur = -1;
  var pxPerFrame = 24;
  var hintDone = false;

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
    info.innerHTML = '<b>Frame ' + String(i+1).padStart(4,'0') + ' / ' + COUNT + '</b><br>' + Math.round(100*(i+1)/COUNT) + '%';
    progFill.style.width = (100*(i+1)/COUNT) + '%';
    progKnob.style.left  = (100*(i+1)/COUNT) + '%';
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
  function onScroll(){
    show(Math.floor(progress() * COUNT));
    if (!hintDone){ hintDone = true; $('#hint').classList.add('hidden'); }
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', function(){ track.style.height = Math.max(COUNT*pxPerFrame, window.innerHeight*2) + 'px'; });

  // barra di avanzamento
  function setFromEvent(e){
    var r = progBar.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (e.clientX - r.left)/r.width));
    window.scrollTo({top: p*(track.offsetHeight-window.innerHeight), behavior:'auto'});
  }
  var dragging = false;
  progBar.addEventListener('pointerdown', function(e){ dragging=true; progBar.setPointerCapture(e.pointerId); setFromEvent(e); });
  progBar.addEventListener('pointermove', function(e){ if(dragging) setFromEvent(e); });
  progBar.addEventListener('pointerup', function(){ dragging=false; });
  progBar.addEventListener('pointercancel', function(){ dragging=false; });

  // impostazioni
  var speed = $('#speed'), speedVal = $('#speedVal');
  $('#settingsBtn').addEventListener('click', function(){ $('#settings').classList.toggle('open'); });
  speed.addEventListener('input', function(){
    pxPerFrame = parseInt(speed.value, 10);
    speedVal.textContent = pxPerFrame + ' px';
    track.style.height = Math.max(COUNT*pxPerFrame, window.innerHeight*2) + 'px';
    onScroll();
  });
  speedVal.textContent = pxPerFrame + ' px';

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
