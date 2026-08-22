# ASTRARIUM — Comunicazione e Contenuti Web

## Architettura del sito — decisioni

Il sito è **one-page lungo e narrativo**, pensato come un viaggio dalla luce al buio: si parte dal problema (il cielo perduto) e si scende verso la soluzione (i luoghi, le esperienze, le persone). La progressione verticale riprende la struttura di una notte di osservazione: crepuscolo → notte → profondità → alba.

### Ordine delle sezioni (e perché)

1. **Hero** — la promessa: "Il cielo che abbiamo perso". Notte piena, stelle animate, un solo messaggio.
2. **Il problema** — dati sull'inquinamento luminoso. Il "perché" prima del "cosa": chi capisce il problema desidera la soluzione.
3. **La storia** — la domanda della bambina del 2016. Le persone si legano alle storie, non ai servizi.
4. **Gli osservatori** — i tre luoghi, con dati concreti (altitudine, Bortle, strumenti). Il prodotto principale.
5. **Le esperienze** — catalogo per linee (Prima Notte, Profondità, Scuole). Prezzi visibili: la trasparenza è un valore.
6. **Il cielo di stanotte** — widget interattivo: cosa si vede ora sopra gli osservatori. Utilità reale, non decorazione.
7. **Le persone** — il team. 34 persone vere (inventate ma credibili), non stock photo generiche.
8. **La Carta del Cielo Buio** — l'impatto. Numeri, mappa dei comuni, bilancio benefit.
9. **Le voci degli ospiti** — testimonianze misurate, in tone of voice.
10. **Domande frequenti** — 8 domande reali (meteo, abbigliamento, bambini, fotografia).
11. **Prenota / Contatti** — chiusura con form e informazioni pratiche.
12. **Footer** — completo, con newsletter "Almanacco" (notizie del cielo del mese).

## Elementi di design

### Principi
- **Dark-first, con ragione:** il sito è scuro perché il tema è il buio — non è una moda estetica. Il contrasto testo/sfondo resta elevato (WCAG AA+).
- **Un solo accento caldo:** l'ambra "Lanterna" (#F2B441) è usata come una luce nel buio: CTA, numeri chiave, dettagli. Tutto il resto è freddo e notturno.
- **Tipografia narrativa:** Fraunces per i titoli (serif, caldo, umano) contro Inter per l'interfaccia. Il contrasto dice: "qui si racconta, ma si è precisi".
- **Numeri, non aggettivi:** ogni sezione ha dati verificabili. "42.000 visitatori" batte "migliaia di turisti entusiasti".
- **Ritmo:** sezioni alternate tra notte piena (#050810) e notte meno profonda (#0B1B3A), come fasce di cielo.

### Componenti ricorrenti
- **Stelle animate** in hero (canvas, parallasse leggera al mouse)
- **Numeri contatore** animati allo scroll
- **Timeline** verticale per la storia
- **Card osservatorio** con dati tecnici in tabella
- **Widget cielo** con mappa celeste generata (posizione di stelle vere)
- **Accordion FAQ**
- **Form contatti** con validazione
- **Toast** per feedback (es. iscrizione newsletter)

### Micro-copy (tone of voice)
- CTA principale: "Prenota la tua notte" (non "Acquista ora!")
- CTA secondaria: "Scopri i cieli" 
- Errore form: "Ci serve questo campo per risponderti."
- Successo newsletter: "Benvenuto. Il primo Almanacco arriva con la luna nuova."
- 404: "Questa pagina è andata dietro l'orizzonte."

## SEO e meta

- Title: "Astrarium — Osservatori del cielo buio | Dolomiti, Etna, Sardegna"
- Description: "Esperienze di osservazione del cielo in tre osservatori certificati sotto i cieli più bui d'Italia. Notti, astrofotografia, scuole. Società Benefit dal 2021."
- Open Graph, favicon SVG (ottogramma), lang="it", semantica HTML5 completa.
