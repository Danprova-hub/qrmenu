# QRMenu MVP

Questo è il primo prototipo del progetto QR dinamico.

## Cosa fa

1. Crea un QR.
2. Il QR contiene un URL dinamico `/q/ID`.
3. `/q/ID` reindirizza al link attuale.
4. Puoi cambiare il link dal pannello.
5. Il QR stampato non cambia.
6. Puoi scaricare il QR in PNG.

## Avvio

Serve Node.js installato.

```bash
npm install
npm start
```

Poi apri:

http://localhost:3000

## Test del funzionamento dinamico

1. Crea un QR con `https://example.com`.
2. Scansiona/apri l'URL dinamico mostrato.
3. Torna nel pannello.
4. Cambia il link in `https://wikipedia.org`.
5. Apri/scansiona lo STESSO QR.
6. Verrai mandato al nuovo link.

## Nota

Questo è un MVP locale: i dati sono salvati in `data.json` e non ci sono ancora account, database cloud, pagamenti o statistiche.
