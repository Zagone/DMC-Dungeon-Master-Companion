import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const patternProviderDismesso = /cloudflare|wrangler|pages\.dev|workers\.dev/i

function controlloFile(file) {
  assert.doesNotMatch(
    readFileSync(path.join(root, file), 'utf8'),
    patternProviderDismesso,
    `Riferimento operativo al provider precedente in ${file}`,
  )
}

function controllaDirectory(directory) {
  const percorso = path.join(root, directory)
  for (const entry of readdirSync(percorso, { withFileTypes: true })) {
    const relativo = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      controllaDirectory(relativo)
    } else if (/\.(?:js|vue|css|html|json|ya?ml|md)$/i.test(entry.name)) {
      controlloFile(relativo)
    }
  }
}

test('Nessun riferimento al provider dismesso in sorgenti e CI', () => {
  controllaDirectory('src')
  controllaDirectory('.github/workflows')
  for (const file of ['package.json', 'package-lock.json', 'vite.config.js', 'index.html', 'README.md']) {
    controlloFile(file)
  }
})

test('Istruzioni operative soltanto per Netlify: niente guida di distribuzione obsoleta', () => {
  assert.equal(existsSync(path.join(root, 'docs/PUBBLICAZIONE_CLOUDFLARE_PAGES.md')), false)
  const readme = readFileSync(path.join(root, 'README.md'), 'utf8')
  assert.match(readme, /Distribuzione online — Netlify/)
  assert.match(readme, /dmc-dungeon-master-companion\.netlify\.app/)
})
