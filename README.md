# 🎞️ AirPlay Bridge — Scroll Video Player

Un mini-sito **HTML autonomo** che riproduce un video **frame per frame mentre scorri la pagina** (effetto "scroll scrubbing", stile pagine prodotto Apple). Funziona offline, su desktop, iPhone e **iPad**.

---

## ✨ Come funziona

- Il video resta fisso sullo schermo mentre **scorri la pagina**: più scorri, più il video avanza.
- Ogni "scatto" dello scorrimento corrisponde a **un fotogramma** (quantizzato a 30 fps di default, configurabile).
- Comandi on-screen: ▶ play/pausa, ◀ ▶ per avanzare/indietreggiare di un frame, barra di avanzamento trascinabile, ⚙️ impostazioni.

---

## 🚀 Metodo 1 — `index.html` (consigliato, un solo file)

1. Metti il tuo video nella **stessa cartella** di `index.html` con il nome **`video.mp4`**.
2. Apri `index.html` nel browser (doppio click) e scorri. Il video si carica da solo.

In alternativa, dentro la pagina puoi:
- trascinare un video direttamente sulla finestra, oppure
- premere **📂** e scegliere il file dal dispositivo, oppure
- incollare un link diretto a un `.mp4`.

### Su iPad / iPhone

1. Copia `index.html` e `video.mp4` in una cartella (anche tramite AirDrop o Files).
2. Apri `index.html` dall'app **Files** → si apre in Safari.
3. Scorri con il dito: il video avanza frame per frame. 🎉

> 💡 Suggerimento: per sentire il controllo "a scatti", abbassa il valore **px/s** nelle impostazioni (⚙️), oppure attiva la modalità **"Per frame"** per decidere quanti pixel di scroll servono per ogni singolo fotogramma.

---

## 🖼️ Metodo 2 — Frame estratti (`extract-frames.sh`)

Se preferisci avere il video *realmente* spezzettato in immagini (max compatibilità, funziona anche offline su dispositivi molto vecchi):

```bash
# 1) installa ffmpeg (una volta sola)
sudo apt install ffmpeg

# 2) estrai i frame al frame rate originale e genera frames.html
./extract-frames.sh video.mp4

# oppure forza un fps specifico
./extract-frames.sh video.mp4 24
```

Viene creato:
- la cartella `frames/` con tutti i frame (`frame_00001.jpg`, `frame_00002.jpg`, …),
- `frames.html`, un sito scroll-scrubbing basato sulle immagini.

Apri `frames.html` e scorri. **Tieni sempre insieme `frames.html` e la cartella `frames/`** (se li copi su iPad, copiali entrambi nella stessa cartella).

---

## ⚙️ Impostazioni (in `index.html`)

| Opzione | Descrizione |
|---|---|
| **Modalità** | `Per durata`: 350 px di scroll = 1 secondo di video. `Per frame`: scegli i pixel per ogni fotogramma. |
| **Velocità** | Cursore per regolare la sensibilità dello scorrimento. |
| **FPS** | Quantizzazione a 12/24/30/60 fps per l'effetto "a fotogrammi", o nessuna per uno scorrimento fluido. |

### Tastiera
- `Spazio` → play / pausa
- `←` / `→` → frame precedente / successivo
- `Home` / `End` → inizio / fine

---

## 📁 Struttura

```
├── index.html          ← player scroll (un solo file, video-based)
├── extract-frames.sh   ← estrae i frame con ffmpeg
├── frames.html         ← generato dallo script (variante a immagini)
├── frames/             ← generata dallo script (frame_00001.jpg, …)
└── video.mp4           ← il TUO video (da aggiungere)
```