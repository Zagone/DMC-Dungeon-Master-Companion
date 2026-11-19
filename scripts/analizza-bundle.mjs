import process from 'node:process'
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

/**
 * Restituisce i file JavaScript statici necessari per il modulo indicato.
 * Non segue dynamicImports: non appartengono al caricamento immediato.
 */
export function dipendenzeStatiche(manifest, radici) {
  const visitati = new Set()
  const file = new Set()
  function visita(chiave) {
    if (visitati.has(chiave)) return
    visitati.add(chiave)
    const voce = manifest[chiave]
    if (!voce) throw new Error(`Modulo non presente nel manifest: ${chiave}`)
    if (voce.file?.endsWith('.js')) file.add(voce.file)
    for (const dipendenza of voce.imports || []) visita(dipendenza)
  }
  for (const radice of radici) visita(radice)
  return [...file].sort()
}

export function dimensioniBundle(manifest, cartella, radici) {
  const file = dipendenzeStatiche(manifest, radici)
  const dimensioni = file.map((nome) => {
    const contenuto = readFileSync(join(cartella, nome))
    return { nome, byte: contenuto.length, gzip: gzipSync(contenuto).length }
  })
  return {
    moduli: dimensioni.length,
    byte: dimensioni.reduce((somma, voce) => somma + voce.byte, 0),
    gzip: dimensioni.reduce((somma, voce) => somma + voce.gzip, 0),
    file: dimensioni,
  }
}

function visualizza(label, risultato) {
  const kib = (byte) => (byte / 1024).toFixed(1)
  process.stdout.write(
    `${label}: ${risultato.moduli} chunk JS, ${kib(risultato.byte)} KiB minificati, ${kib(risultato.gzip)} KiB gzip (stima)\n`,
  )
}

const invocatoComeScript = Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invocatoComeScript) {
  const dist = fileURLToPath(new URL('../dist/', import.meta.url))
  const percorso = join(dist, '.vite', 'manifest.json')
  if (!existsSync(percorso)) {
    console.error('Manifest assente: esegui prima npm run build.')
    process.exitCode = 1
  } else {
    const manifest = JSON.parse(readFileSync(percorso, 'utf8'))
    const ingresso = Object.keys(manifest).find((chiave) => manifest[chiave].isEntry)
    const home = 'src/views/DashboardView.vue'
    if (!ingresso || !manifest[home]) {
      console.error('Manifest incompleto: ingresso o DashboardView non trovati.')
      process.exitCode = 1
    } else {
      const avvio = dimensioniBundle(manifest, dist, [ingresso])
      const homeTotale = dimensioniBundle(manifest, dist, [ingresso, home])
      visualizza('Avvio (moduli JS statici)', avvio)
      visualizza('Home (avvio + chunk statici Dashboard)', homeTotale)
      for (const [nome, modulo] of [
        ['Gestione backup', 'src/components/GestioneArchivioDMC.vue'],
        ['Creazione assistita', 'src/components/CreazioneAssistitaCampagna.vue'],
      ]) {
        if (manifest[modulo]) visualizza(nome + ' (caricamento su richiesta)', dimensioniBundle(manifest, dist, [modulo]))
        else console.warn(`Modulo differito non individuato nel manifest: ${modulo}`)
      }
      console.log('Valori teorici dei file generati, non tempi di rete o quantità realmente trasferita dal browser.')
    }
  }
}
