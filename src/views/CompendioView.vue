<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { REGOLE_SRD, SCUOLE_SRD } from '../dati/compendioSRD.js'
import { validaArchivioIncantesimi } from '../dati/archivioIncantesimiCompleti.js'
import { caricaSezioneSRD, estrattoVoceSRD } from '../dati/caricamentoSezioniSRD.js'
import { estraiSchedeSpecieSRD } from '../dati/estrazioneSpecieSRD.js'
import { BACKGROUND_SRD } from '../dati/backgroundSRD.js'
import { estraiTalentiSRD } from '../dati/estrazioneTalentiSRD.js'
import { estraiClassiSRD } from '../dati/estrazioneClassiSRD.js'
import { estraiDettagliClassiSRD } from '../dati/dettagliClassiSRD.js'
import { PROGRESSIONI_CLASSI_SRD } from '../dati/progressioniClassiSRD.js'
import { MONETE_SRD } from '../dati/moneteSRD.js'
import { ARMI_SEMPLICI_SRD } from '../dati/armiSempliciSRD.js'
import { ARMI_DA_GUERRA_SRD, ARMATURE_SRD } from '../dati/armiArmatureSRD.js'
import { STRUMENTI_SRD } from '../dati/strumentiSRD.js'
import { EQUIPAGGIAMENTO_AVVENTURA_SRD } from '../dati/equipaggiamentoAvventuraSRD.js'
import { CAVALCATURE_SRD, FINIMENTI_SRD, NAVI_SRD } from '../dati/cavalcatureVeicoliSRD.js'
import { estraiIndiceOggettiMagici } from '../dati/indiceOggettiMagiciSRD.js'
import {
  chiaveSRD,
  estraiGlossarioSRD,
  estraiTestiOggettiMagiciSRD,
  estraiTestoSingolaVoceSRD,
  estraiTestiEquipaggiamentoSRD,
  estraiTestiStrumentiSRD,
  estraiTestiSpecieSRD,
  estraiTestiOriginiSRD,
} from '../dati/letturaStrutturataSRD.js'
import TestoCompendioSRD from '../components/TestoCompendioSRD.vue'
import SchedaDettagliClasseSRD from '../components/SchedaDettagliClasseSRD.vue'

const ricerca = ref('')
const archivioCompleto = ref(null)
const schedeSpecie = ref(new Map())
const testiSpecie = ref(new Map())
const testiOrigini = ref(new Map())
const testiClassi = ref(new Map())
const schedeClassi = ref(new Map())
const schedeBackground = new Map(BACKGROUND_SRD.map((v) => [v.nome, v]))
const schedeTalenti = ref([])
const schedeOggettiMagici = ref([])
const schedeGlossario = ref([])
const testiEquipaggiamento = ref(new Map())
const testiStrumenti = ref(new Map())
const testoFonte = ref('')
const voceFonte = ref(null)
const erroreFonte = ref('')
const caricamentoFonte = ref(false)
// Gli archivi estesi sono caricati solo quando la categoria è richiesta.
// La ricerca globale carica tutte le categorie una sola volta; il loader
// condiviso conserva in cache le richieste e gli eventuali errori.
const caricamentoCategorie = ref(new Set())
const categorieCaricate = new Set()
const categorieInCorso = new Map()
async function caricaCategoria(categoriaRichiesta) {
  const destinazioni = categoriaRichiesta
    ? [categoriaRichiesta]
    : ['Incantesimi', 'Specie', 'Talenti', 'Oggetti magici', 'Regole', 'Equipaggiamento', 'Classi', 'Origini']
  await Promise.all(
    destinazioni.map(async (nome) => {
      const sezione = nome === 'Condizioni' ? 'Regole' : nome
      if (!['Incantesimi', 'Specie', 'Talenti', 'Oggetti magici', 'Regole', 'Equipaggiamento', 'Classi', 'Origini'].includes(sezione))
        return
      if (categorieCaricate.has(sezione)) return
      if (categorieInCorso.has(sezione)) return categorieInCorso.get(sezione)
      const richiesta = (async () => {
        caricamentoCategorie.value = new Set([...caricamentoCategorie.value, sezione])
        try {
          const archivio = await caricaSezioneSRD(sezione === 'Regole' ? 'Condizioni' : sezione)
          if (nome === 'Incantesimi') archivioCompleto.value = validaArchivioIncantesimi(archivio)
          if (nome === 'Specie') {
            schedeSpecie.value = new Map(estraiSchedeSpecieSRD(archivio).map((v) => [v.nome, v]))
            testiSpecie.value = estraiTestiSpecieSRD(archivio)
          }
          if (sezione === 'Origini') testiOrigini.value = estraiTestiOriginiSRD(archivio)
          if (sezione === 'Classi') {
            const estratte = estraiClassiSRD(archivio)
            testiClassi.value = estratte
            schedeClassi.value = estraiDettagliClassiSRD(archivio, estratte)
          }
          if (nome === 'Talenti') schedeTalenti.value = estraiTalentiSRD(archivio)
          if (nome === 'Oggetti magici')
            schedeOggettiMagici.value = estraiTestiOggettiMagiciSRD(
              archivio, estraiIndiceOggettiMagici(archivio),
            )
          if (sezione === 'Equipaggiamento') {
            testiEquipaggiamento.value = estraiTestiEquipaggiamentoSRD(archivio, EQUIPAGGIAMENTO_AVVENTURA_SRD)
            testiStrumenti.value = estraiTestiStrumentiSRD(archivio, STRUMENTI_SRD)
          }
          if (sezione === 'Regole') {
            schedeGlossario.value = estraiGlossarioSRD(archivio)
            categorieCaricate.add('Condizioni')
          }
          categorieCaricate.add(sezione)
        } catch (errore) {
          console.warn('Caricamento del compendio non riuscito per ' + nome, errore)
        } finally {
          categorieInCorso.delete(sezione)
          const attive = new Set(caricamentoCategorie.value)
          attive.delete(sezione)
          caricamentoCategorie.value = attive
        }
      })()
      categorieInCorso.set(sezione, richiesta)
      return richiesta
    }),
  )
}
onMounted(() => {
  // Nessun archivio corposo viene scaricato sulla schermata iniziale.
  if (ricerca.value.trim()) void caricaCategoria('')
})

const vociCompendio = computed(() => {
  const nuove = new Map((archivioCompleto.value || []).map((v) => [v.nome, v]))
  const nomiIndice = new Set(REGOLE_SRD.filter((v) => v.categoria === 'Talenti').map((v) => v.nome))
  const talentiAggiuntivi = schedeTalenti.value
    .filter((v) => !nomiIndice.has(v.nome))
    .map((v) => ({
      ...v,
      id: 'talento-srd-' + v.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoria: 'Talenti',
      sintesi: v.categoriaTalento,
      schedaTalento: v,
    }))
  const schedeArmi = [
    ...ARMI_SEMPLICI_SRD.map((arma) => ({
      ...arma,
      danno: arma.dadiDanno + ' ' + arma.tipoDanno,
    })),
    ...ARMI_DA_GUERRA_SRD,
  ].map((arma) => ({
    id: 'equip-arma-' + arma.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    nome: arma.nome,
    categoria: 'Equipaggiamento',
    pagina: arma.pagina,
    sintesi: arma.danno,
    schedaArma: arma,
    dettagliCompleti: false,
  }))
  const schedeArmature = ARMATURE_SRD.map((armatura) => ({
    id: 'equip-armatura-' + armatura.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    nome: armatura.nome,
    categoria: 'Equipaggiamento',
    pagina: armatura.pagina,
    sintesi: armatura.classeArmatura,
    schedaArmatura: armatura,
    dettagliCompleti: false,
  }))
  const schedeStrumenti = STRUMENTI_SRD.map((strumento) => ({
    ...(testiStrumenti.value.has(strumento.nome)
      ? {
          descrizione: testiStrumenti.value.get(strumento.nome).testo,
          descrizioneEstratta: true,
          pagineFonte: testiStrumenti.value.get(strumento.nome).pagine,
        }
      : {}),
    id:
      'equip-strumento-' +
      strumento.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-'),
    nome: strumento.nome,
    categoria: 'Equipaggiamento',
    pagina: strumento.pagina,
    sintesi: 'Strumento ' + strumento.tipologia.toLowerCase() + ' · ' + strumento.costo,
    schedaStrumento: strumento,
    dettagliCompleti: false,
  }))
  const schedeAvventura = EQUIPAGGIAMENTO_AVVENTURA_SRD.map((oggetto) => ({
    ...(testiEquipaggiamento.value.has(oggetto.nome)
      ? {
          descrizione: testiEquipaggiamento.value.get(oggetto.nome).testo,
          descrizioneEstratta: true,
          pagineFonte: testiEquipaggiamento.value.get(oggetto.nome).pagine,
        }
      : {}),
    id:
      'equip-avventura-' +
      oggetto.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-'),
    nome: oggetto.nome,
    categoria: 'Equipaggiamento',
    pagina: oggetto.pagina,
    sintesi: oggetto.sintesi,
    schedaAvventura: oggetto,
    dettagliCompleti: false,
  }))
  const schedeTrasporti = [...CAVALCATURE_SRD, ...FINIMENTI_SRD, ...NAVI_SRD].map((voce) => ({
    id:
      'equip-trasporto-' +
      voce.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\\u0300-\\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-'),
    nome: voce.nome,
    categoria: 'Equipaggiamento',
    pagina: voce.pagina,
    sintesi:
      voce.gruppo === 'cavalcature'
        ? 'Capacità di trasporto: ' + voce.capacitaTrasporto + ' · ' + voce.costo
        : voce.gruppo === 'finimenti'
          ? 'Peso: ' + voce.peso + ' · ' + voce.costo
          : 'Velocità: ' + voce.velocita + ' · ' + voce.costo,
    schedaTrasporto: voce,
    dettagliCompleti: false,
  }))
  const voceMonete = {
    id: 'equip-monete',
    nome: 'Monete',
    categoria: 'Equipaggiamento',
    pagina: 101,
    sintesi: 'Valori delle cinque denominazioni monetarie SRD.',
    dettagliCompleti: false,
  }
  const indiceOggettiEsistenti = new Set(
    REGOLE_SRD.filter((v) => v.categoria === 'Oggetti magici').map((v) =>
      v.nome.toLocaleLowerCase('it-IT'),
    ),
  )
  const oggettiAggiuntivi = schedeOggettiMagici.value.filter(
    (v) => !indiceOggettiEsistenti.has(v.nome.toLocaleLowerCase('it-IT')),
  )
  const nomiGlossario = new Set(
    schedeGlossario.value.map((voce) => voce.categoria + ':' + chiaveSRD(voce.nome)),
  )
  const base = REGOLE_SRD.filter((voce) => {
    if (!['Regole', 'Condizioni'].includes(voce.categoria)) return true
    const nome = voce.nome === 'Azioni bonus' ? 'Azione bonus' : voce.nome
    return !nomiGlossario.has(voce.categoria + ':' + chiaveSRD(nome))
  })
  return [
    ...base.map((v) => {
      if (v.categoria === 'Incantesimi') {
        const dettagli = nuove.get(v.nome)
        return dettagli
          ? {
              ...v,
              ...dettagli,
              id: v.id,
              categoria: v.categoria,
              sintesi: dettagli.descrizione || v.sintesi,
            }
          : v
      }
      if (v.categoria === 'Talenti') {
        const dettagli = schedeTalenti.value.find((t) => t.nome === v.nome)
        return dettagli ? { ...v, schedaTalento: dettagli } : v
      }
      if (v.categoria === 'Origini') {
        const dettagli = schedeBackground.get(v.nome)
        return dettagli ? { ...v, schedaBackground: dettagli } : v
      }
      if (v.categoria === 'Specie') {
        const dettagli = schedeSpecie.value.get(v.nome)
        const corpo = testiSpecie.value.get(v.nome)
        return dettagli
          ? {
              ...v,
              schedaSpecie: dettagli,
              descrizioneSpecie: corpo?.testo || '',
              pagineFonte: dettagli.pagine,
            }
          : v
      }
      if (v.categoria === 'Origini') {
        const corpo = testiOrigini.value.get(v.nome)
        return corpo ? { ...v, descrizioneOrigine: corpo.testo } : v
      }
      if (v.categoria === 'Classi') {
        const corpo = testiClassi.value.get(v.nome)
        const scheda = schedeClassi.value.get(v.nome)
        return corpo
          ? { ...v, descrizioneClasse: corpo.testo, privilegiClasse: corpo.privilegi,
              schedaClasse: scheda,
              tabellaProgressione: PROGRESSIONI_CLASSI_SRD[v.nome],
              pagineClasse: corpo.pagine }
          : v
      }
      return v
    }),
    ...schedeGlossario.value,
    ...talentiAggiuntivi,
    ...schedeArmi,
    ...schedeArmature,
    ...schedeStrumenti,
    ...schedeAvventura,
    ...schedeTrasporti,
    voceMonete,
    ...oggettiAggiuntivi,
  ]
})
const categoria = ref('')
const ordinamento = ref('az')
const gruppoEquipaggiamento = ref('')
const raritaOggetto = ref('')
const sintoniaOggetto = ref('')
const livello = ref('')
const scuola = ref('')
const tempo = ref('')
const componente = ref('')
const soloDettagli = ref(false)
const pagina = ref(1)
const perPagina = 35
const filtriMagia = computed(() => categoria.value === 'Incantesimi')
const filtriEquipaggiamento = computed(() => categoria.value === 'Equipaggiamento')
const filtriOggettiMagici = computed(() => categoria.value === 'Oggetti magici')
const raritaOggettiMagici = Object.freeze([
  'comune',
  'non comune',
  'raro',
  'molto raro',
  'leggendario',
  'artefatto',
])
const gruppiEquipaggiamento = Object.freeze([
  { id: 'mischia', titolo: 'Armi da mischia' },
  { id: 'distanza', titolo: 'Armi a distanza' },
  { id: 'leggere', titolo: 'Armature leggere' },
  { id: 'medie', titolo: 'Armature medie' },
  { id: 'pesanti', titolo: 'Armature pesanti' },
  { id: 'scudi', titolo: 'Scudi' },
  { id: 'strumenti', titolo: 'Strumenti' },
  { id: 'avventura', titolo: 'Equipaggiamento d’avventura' },
  { id: 'cavalcature', titolo: 'Cavalcature e animali' },
  { id: 'finimenti', titolo: 'Finimenti e veicoli da tiro' },
  { id: 'navi', titolo: 'Veicoli aerei e imbarcazioni' },
  { id: 'altro', titolo: 'Altro equipaggiamento' },
])
function gruppoDiEquipaggiamento(voce) {
  if (voce.schedaTrasporto) return voce.schedaTrasporto.gruppo
  if (voce.schedaAvventura) return 'avventura'
  if (voce.schedaStrumento) return 'strumenti'
  if (voce.schedaArma) return voce.schedaArma.impiego === 'Mischia' ? 'mischia' : 'distanza'
  if (voce.schedaArmatura) {
    const categoriaArmatura = voce.schedaArmatura.categoria
    return (
      { Leggera: 'leggere', Media: 'medie', Pesante: 'pesanti', Scudo: 'scudi' }[
        categoriaArmatura
      ] || 'altro'
    )
  }
  return 'altro'
}
const ordineGruppi = Object.freeze(
  Object.fromEntries(gruppiEquipaggiamento.map((g, i) => [g.id, i])),
)
const aperta = ref(null)

const categorie = [
  { id: 'Condizioni', titolo: 'Condizioni', descrizione: 'Stati e conseguenze sul personaggio.' },
  { id: 'Incantesimi', titolo: 'Incantesimi', descrizione: 'Magia, scuole, livelli e componenti.' },
  { id: 'Regole', titolo: 'Regole', descrizione: 'Azioni, prove, combattimento e riposi.' },
  { id: 'Origini', titolo: 'Origini', descrizione: 'Background e dotazioni iniziali.' },
  { id: 'Classi', titolo: 'Classi', descrizione: 'Progressione e capacità dei personaggi.' },
  { id: 'Specie', titolo: 'Specie', descrizione: 'Tratti e capacità delle specie giocabili.' },
  { id: 'Talenti', titolo: 'Talenti', descrizione: 'Opzioni di personalizzazione.' },
  { id: 'Equipaggiamento', titolo: 'Equipaggiamento', descrizione: 'Armi, armature e strumenti.' },
  { id: 'Oggetti magici', titolo: 'Oggetti magici', descrizione: 'Oggetti e artefatti.' },
]
// L'indice viene ricalcolato solo quando il catalogo cambia, non a ogni battuta.
const normalizzaRicerca = (testo) =>
  String(testo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('it-IT')

const indiceRicerca = computed(
  () =>
    new Map(
      vociCompendio.value.map((voce) => [
        voce.id,
        normalizzaRicerca(
          [
            voce.nome, voce.sintesi, voce.scuola, voce.descrizione,
            voce.descrizioneSpecie, voce.descrizioneOrigine, voce.descrizioneClasse,
            voce.schedaTalento?.descrizione, voce.schedaSpecie?.tratti?.join(' '),
            voce.tipo, voce.rarita,
          ].filter(Boolean).join(' '),
        ),
      ]),
    ),
)

const risultati = computed(() => {
  const q = normalizzaRicerca(ricerca.value).trim()
  const voci = vociCompendio.value.filter(
    (v) =>
      (!categoria.value || v.categoria === categoria.value) &&
      (!filtriEquipaggiamento.value ||
        !gruppoEquipaggiamento.value ||
        gruppoDiEquipaggiamento(v) === gruppoEquipaggiamento.value) &&
      (!filtriOggettiMagici.value || !raritaOggetto.value || v.rarita === raritaOggetto.value) &&
      (!filtriOggettiMagici.value ||
        !sintoniaOggetto.value ||
        (v.indicizzazioneAutomatica && String(v.richiedeSintonia) === sintoniaOggetto.value)) &&
      (livello.value === '' || v.livello === Number(livello.value)) &&
      (!scuola.value || v.scuola === scuola.value) &&
      (!tempo.value || (v.tempoLancio || '').toLocaleLowerCase('it-IT').includes(tempo.value)) &&
      (!componente.value ||
        new RegExp('(^|[, ])' + componente.value + '(?=[, (]|$)').test(v.componenti || '')) &&
      (!q || indiceRicerca.value.get(v.id)?.includes(q)),
  )
  return voci
    .filter(
      (v) =>
        !soloDettagli.value ||
        v.categoria !== 'Incantesimi' ||
        Boolean(v.verificato || v.dettagliCompleti),
    )
    .sort((a, b) => {
      if (filtriEquipaggiamento.value) {
        const differenza =
          ordineGruppi[gruppoDiEquipaggiamento(a)] - ordineGruppi[gruppoDiEquipaggiamento(b)]
        if (differenza) return differenza
      }
      return ordinamento.value === 'za'
        ? b.nome.localeCompare(a.nome, 'it')
        : a.nome.localeCompare(b.nome, 'it')
    })
})
const pagineTotali = computed(() => Math.max(1, Math.ceil(risultati.value.length / perPagina)))
const risultatiPagina = computed(() =>
  risultati.value.slice((pagina.value - 1) * perPagina, pagina.value * perPagina),
)
// La scheda apre automaticamente il testo pertinente; non espone più
// un pulsante per visualizzare un'intera pagina grezza del PDF.
let versioneConsultazione = 0

function annullaConsultazione() {
  versioneConsultazione += 1
  testoFonte.value = ''
  erroreFonte.value = ''
  voceFonte.value = null
  caricamentoFonte.value = false
}

// Una nuova consultazione prevale sulla precedente anche con richieste
// concorrenti: una risposta tardiva non può sovrascrivere la voce aperta.
async function consultaFonte(regola) {
  if (!['Classi', 'Origini', 'Regole', 'Condizioni'].includes(regola.categoria)) return
  const versione = ++versioneConsultazione
  testoFonte.value = ''
  erroreFonte.value = ''
  voceFonte.value = regola.id
  caricamentoFonte.value = true
  try {
    const dati = await caricaSezioneSRD(regola.categoria)
    if (versione !== versioneConsultazione || aperta.value !== regola.id) return
    const testo = regola.categoria === 'Classi'
      ? estrattoVoceSRD(dati, regola).testo
      : estraiTestoSingolaVoceSRD(dati, regola)
    testoFonte.value = testo
    if (!testo) {
      erroreFonte.value = 'La descrizione completa non è ancora associata con certezza a questa voce.'
    }
  } catch (errore) {
    if (versione === versioneConsultazione && aperta.value === regola.id) {
      erroreFonte.value = errore.message || 'Impossibile caricare la voce.'
    }
  } finally {
    if (versione === versioneConsultazione) caricamentoFonte.value = false
  }
}

function scegliCategoria(id) {
  categoria.value = id
  if (id) void caricaCategoria(id)
  gruppoEquipaggiamento.value = ''
  raritaOggetto.value = ''
  sintoniaOggetto.value = ''
  livello.value = ''
  scuola.value = ''
  tempo.value = ''
  componente.value = ''
  soloDettagli.value = false
  pagina.value = 1
  aperta.value = null
  annullaConsultazione()
}
function pulisci() {
  ricerca.value = ''
  categoria.value = ''
  gruppoEquipaggiamento.value = ''
  raritaOggetto.value = ''
  sintoniaOggetto.value = ''
  tempo.value = ''
  componente.value = ''
  ordinamento.value = 'az'
  livello.value = ''
  scuola.value = ''
  soloDettagli.value = false
  pagina.value = 1
  aperta.value = null
  annullaConsultazione()
}
watch(ricerca, (valore) => {
  if (valore.trim()) void caricaCategoria('')
})
watch(categoria, (valore) => {
  if (valore) void caricaCategoria(valore)
})
watch(
  [
    ricerca,
    categoria,
    gruppoEquipaggiamento,
    raritaOggetto,
    sintoniaOggetto,
    livello,
    scuola,
    tempo,
    componente,
    soloDettagli,
    ordinamento,
  ],
  () => {
    pagina.value = 1
    aperta.value = null
    annullaConsultazione()
  },
)
</script>

<template>
  <main class="compendio-pagina dmc-contenitore">
    <header class="compendio-eroe">
      <small class="compendio-sopratitolo">DUNGEON MASTER COMPANION · SRD 5.2.1</small>
      <h1>Compendio</h1>
      <p>
        Consulta le condizioni, le regole e gli incantesimi dell'SRD 5.2.1. Cerca una voce oppure
        esplora le categorie.
      </p>
      <label class="compendio-ricerca">
        <span class="sr-only">Cerca nel compendio</span>
        <input v-model="ricerca" type="search" placeholder="Cerca regole, effetti, incantesimi..." />
      </label>
    </header>

    <section
      v-if="!categoria && !ricerca.trim()"
      class="compendio-categorie"
      aria-label="Categorie del compendio"
    >
      <button
        v-for="voce in categorie"
        :key="voce.id"
        type="button"
        class="compendio-categoria dmc-pannello"
        @click="scegliCategoria(voce.id)"
      >
        <span class="compendio-categoria-titolo"
          >{{ voce.titolo }}
          <small>{{ vociCompendio.filter((r) => r.categoria === voce.id).length }}</small></span
        >
        <span class="compendio-categoria-descrizione">{{ voce.descrizione }}</span>
      </button>
    </section>

    <div class="compendio-layout">
      <aside class="compendio-filtri dmc-pannello" aria-label="Filtri del compendio">
        <div class="compendio-filtri-testa">
          <h2>Filtri</h2>
          <button type="button" @click="pulisci">Azzera</button>
        </div>
        <fieldset>
          <legend>Categoria</legend>
          <label><input v-model="categoria" type="radio" value="" /> Tutte</label>
          <label v-for="voce in categorie" :key="voce.id">
            <input v-model="categoria" type="radio" :value="voce.id" />
            {{ voce.titolo }}
            <small>({{ vociCompendio.filter((r) => r.categoria === voce.id).length }})</small>
          </label>
        </fieldset>
        <fieldset v-if="filtriEquipaggiamento">
          <legend>Tipologia equipaggiamento</legend>
          <label
            ><input v-model="gruppoEquipaggiamento" type="radio" value="" /> Tutte le
            tipologie</label
          >
          <label v-for="gruppo in gruppiEquipaggiamento" :key="gruppo.id">
            <input v-model="gruppoEquipaggiamento" type="radio" :value="gruppo.id" />
            {{ gruppo.titolo }}
          </label>
        </fieldset>
        <fieldset v-if="filtriOggettiMagici">
          <legend>Rarità degli oggetti magici</legend>
          <label><input v-model="raritaOggetto" type="radio" value="" /> Tutte le rarità</label>
          <label v-for="rarita in raritaOggettiMagici" :key="rarita">
            <input v-model="raritaOggetto" type="radio" :value="rarita" /> {{ rarita }}
          </label>
        </fieldset>
        <fieldset v-if="filtriOggettiMagici">
          <legend>Sintonia</legend>
          <label><input v-model="sintoniaOggetto" type="radio" value="" /> Tutti</label>
          <label
            ><input v-model="sintoniaOggetto" type="radio" value="true" /> Richiede sintonia</label
          >
          <label
            ><input v-model="sintoniaOggetto" type="radio" value="false" /> Non richiede
            sintonia</label
          >
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Livello</legend>
          <label><input v-model="livello" type="radio" value="" /> Tutti i livelli</label>
          <label v-for="n in 10" :key="n"
            ><input v-model="livello" type="radio" :value="String(n - 1)" />
            {{ n === 1 ? 'Trucchetto' : 'Livello ' + (n - 1) }}</label
          >
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Scuola</legend>
          <label><input v-model="scuola" type="radio" value="" /> Tutte le scuole</label>
          <label v-for="s in SCUOLE_SRD" :key="s"
            ><input v-model="scuola" type="radio" :value="s" /> {{ s }}</label
          >
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Tempo di lancio</legend>
          <label><input v-model="tempo" type="radio" value="" /> Tutti</label>
          <label><input v-model="tempo" type="radio" value="azione bonus" /> Azione bonus</label>
          <label><input v-model="tempo" type="radio" value="reazione" /> Reazione</label>
          <label><input v-model="tempo" type="radio" value="rituale" /> Rituale</label>
          <label><input v-model="tempo" type="radio" value="minuto" /> Minuti</label>
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Componenti</legend>
          <label><input v-model="componente" type="radio" value="" /> Tutte</label>
          <label><input v-model="componente" type="radio" value="V" /> Verbali (V)</label>
          <label><input v-model="componente" type="radio" value="S" /> Somatiche (S)</label>
          <label><input v-model="componente" type="radio" value="M" /> Materiali (M)</label>
        </fieldset>
        <label v-if="filtriMagia" class="compendio-opzione-dettagli"
          ><input v-model="soloDettagli" type="checkbox" /> Solo schede con dettagli
          disponibili</label
        >
        <p class="compendio-nota">
          Le schede integrali provengono dall’estrazione del PDF e non sono ancora tutte revisionate
          manualmente.
        </p>
      </aside>

      <section class="compendio-risultati" aria-label="Risultati del compendio">
        <div class="compendio-barra">
          <div>
            <h2>{{ categoria || (ricerca ? 'Risultati della ricerca' : 'Tutte le voci') }}</h2>
            <small>{{ risultati.length }} risultati</small>
          </div>
          <label
            >Ordina
            <select v-model="ordinamento">
              <option value="az">Nome A–Z</option>
              <option value="za">Nome Z–A</option>
            </select>
          </label>
        </div>
        <p v-if="caricamentoCategorie.size" class="compendio-nota" role="status" aria-live="polite">
          Caricamento delle schede SRD in corso… I risultati si aggiornano automaticamente.
        </p>
        <div class="compendio-elenco">
          <template v-for="(regola, indice) in risultatiPagina" :key="regola.id">
            <h3
              v-if="
                filtriEquipaggiamento &&
                (indice === 0 ||
                  gruppoDiEquipaggiamento(risultatiPagina[indice - 1]) !==
                    gruppoDiEquipaggiamento(regola))
              "
              class="compendio-gruppo-titolo"
            >
              {{
                gruppiEquipaggiamento.find((g) => g.id === gruppoDiEquipaggiamento(regola))?.titolo
              }}
            </h3>
            <details
              class="compendio-voce dmc-pannello"
              :open="aperta === regola.id"
              @toggle="
                (e) => {
                  if (e.target.open) {
                    aperta = regola.id
                    testoFonte = ''
                    erroreFonte = ''
                    voceFonte = null
                    if (
                      !regola.dettagliCompleti &&
                      !regola.descrizioneClasse &&
                      !regola.descrizioneOrigine &&
                      ['Classi', 'Origini', 'Regole', 'Condizioni'].includes(regola.categoria)
                    ) void consultaFonte(regola)
                  } else if (aperta === regola.id) {
                    aperta = null
                    annullaConsultazione()
                  }
                }
              "
            >
              <summary>
                <span
                  ><strong>{{ regola.nome }}</strong
                  ><small>{{
                    regola.categoria === 'Incantesimi'
                      ? (regola.livello === 0 ? 'Trucchetto' : 'Livello ' + regola.livello) +
                        ' · ' +
                        regola.scuola
                      : regola.categoria
                  }}</small></span
                ><span aria-hidden="true">⌄</span>
              </summary>
              <div class="compendio-testo">
                <div
                  v-if="regola.dettagliCompleti && regola.descrizione"
                  class="compendio-descrizione"
                >
                  <TestoCompendioSRD :testo="regola.descrizione" :etichetta="'Regole di ' + regola.nome" />
                </div>
                <p v-else>{{ regola.sintesi }}</p>
                <div v-if="regola.schedaArma" class="compendio-arma">
                  <p>
                    <strong>Categoria:</strong> {{ regola.schedaArma.categoria }} ·
                    {{ regola.schedaArma.impiego }}
                  </p>
                  <p>
                    <strong>Danni:</strong> {{ regola.schedaArma.danno }} · <strong>Costo:</strong>
                    {{ regola.schedaArma.costo }}
                  </p>
                  <p><strong>Proprietà:</strong> {{ regola.schedaArma.proprieta }}</p>
                  <p>
                    <strong>Padronanza:</strong> {{ regola.schedaArma.padronanza }} ·
                    <strong>Peso:</strong> {{ regola.schedaArma.peso }}
                  </p>
                </div>
                <p v-if="regola.indicizzazioneAutomatica" class="compendio-metadata">
                  <strong>Tipologia:</strong> {{ regola.tipo }} · <strong>Rarità:</strong>
                  {{ regola.rarita }} · <strong>Sintonia:</strong>
                  {{ regola.richiedeSintonia ? 'Richiesta' : 'Non indicata' }}
                </p>
                <p v-if="regola.indicizzazioneAutomatica" class="compendio-nota">
                  Voce estratta automaticamente dall'SRD: la revisione editoriale resta necessaria.
                </p>
                <div v-if="regola.descrizioneEstratta && regola.descrizione" class="compendio-descrizione">
                  <h4>Descrizione dell'oggetto</h4>
                  <TestoCompendioSRD :testo="regola.descrizione" :etichetta="'Descrizione di ' + regola.nome" />
                </div>
                <div v-if="regola.schedaTrasporto" class="compendio-trasporto">
                  <template v-if="regola.schedaTrasporto.gruppo === 'cavalcature'">
                    <p>
                      <strong>Capacità di trasporto:</strong>
                      {{ regola.schedaTrasporto.capacitaTrasporto }} · <strong>Costo:</strong>
                      {{ regola.schedaTrasporto.costo }}
                    </p>
                  </template>
                  <template v-else-if="regola.schedaTrasporto.gruppo === 'finimenti'">
                    <p>
                      <strong>Peso:</strong> {{ regola.schedaTrasporto.peso }} ·
                      <strong>Costo:</strong> {{ regola.schedaTrasporto.costo }}
                    </p>
                  </template>
                  <template v-else>
                    <p>
                      <strong>Velocità:</strong> {{ regola.schedaTrasporto.velocita }} ·
                      <strong>Costo:</strong> {{ regola.schedaTrasporto.costo }}
                    </p>
                    <p>
                      <strong>Equipaggio:</strong> {{ regola.schedaTrasporto.equipaggio }} ·
                      <strong>Passeggeri:</strong> {{ regola.schedaTrasporto.passeggeri }} ·
                      <strong>Carico:</strong> {{ regola.schedaTrasporto.caricoTonnellate }} t
                    </p>
                    <p>
                      <strong>CA:</strong> {{ regola.schedaTrasporto.ca }} · <strong>PF:</strong>
                      {{ regola.schedaTrasporto.pf }} · <strong>Soglia di danno:</strong>
                      {{ regola.schedaTrasporto.sogliaDanno }}
                    </p>
                  </template>
                  <p class="compendio-nota">Statistiche SRD. Le regole d'uso specifiche non sono ancora state revisionate.</p>
                </div>
                <div v-if="regola.schedaAvventura" class="compendio-avventura">
                  <p>
                    <strong>Peso:</strong> {{ regola.schedaAvventura.peso }} ·
                    <strong>Costo:</strong> {{ regola.schedaAvventura.costo }}
                  </p>
                  <p class="compendio-nota">Dati tabellari SRD; descrizione d'uso non ancora revisionata.</p>
                </div>
                <div v-if="regola.schedaStrumento" class="compendio-strumento">
                  <p>
                    <strong>Tipologia:</strong> {{ regola.schedaStrumento.tipologia }} ·
                    <strong>Caratteristica:</strong> {{ regola.schedaStrumento.caratteristica }}
                  </p>
                  <p>
                    <strong>Costo:</strong> {{ regola.schedaStrumento.costo }} ·
                    <strong>Peso:</strong> {{ regola.schedaStrumento.peso }}
                  </p>
                  <p class="compendio-nota">Utilizzi, creazioni e varianti sono in revisione editoriale.</p>
                </div>
                <div v-if="regola.schedaArmatura" class="compendio-armatura">
                  <p>
                    <strong>Categoria:</strong> {{ regola.schedaArmatura.categoria }} ·
                    <strong>CA:</strong> {{ regola.schedaArmatura.classeArmatura }}
                  </p>
                  <p>
                    <strong>Forza minima:</strong> {{ regola.schedaArmatura.forzaMinima ?? '—' }} ·
                    <strong>Furtività:</strong>
                    {{ regola.schedaArmatura.svantaggioFurtivita ? 'Svantaggio' : '—' }}
                  </p>
                  <p>
                    <strong>Peso:</strong> {{ regola.schedaArmatura.peso }} ·
                    <strong>Costo:</strong> {{ regola.schedaArmatura.costo }}
                  </p>
                </div>
                <div v-if="regola.id === 'equip-monete'" class="compendio-monete">
                  <strong>Valore delle monete (espresso in monete d'oro)</strong>
                  <table>
                    <thead>
                      <tr>
                        <th>Moneta</th>
                        <th>Sigla</th>
                        <th>Valore in mo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="moneta in MONETE_SRD" :key="moneta.sigla">
                        <td>{{ moneta.nome }}</td>
                        <td>{{ moneta.sigla }}</td>
                        <td>
                          {{
                            moneta.denominatore === 1
                              ? moneta.numeratore
                              : moneta.numeratore + '/' + moneta.denominatore
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <SchedaDettagliClasseSRD
                  v-if="regola.schedaClasse && regola.tabellaProgressione"
                  :scheda="regola.schedaClasse"
                  :progressione="regola.tabellaProgressione"
                />
                <div v-if="regola.schedaTalento" class="compendio-estratto-specie">
                  <small
                    >{{ regola.schedaTalento.categoriaTalento }} · Pagina SRD
                    {{ regola.schedaTalento.pagine.join(', ') }} · Testo estratto, da
                    revisionare</small
                  >
                  <TestoCompendioSRD :testo="regola.schedaTalento.descrizione" />
                </div>
                <div v-if="regola.schedaBackground" class="compendio-background">
                  <dl class="compendio-scheda-incantesimo">
                    <div>
                      <dt>Caratteristiche</dt>
                      <dd>{{ regola.schedaBackground.caratteristiche.join(', ') }}</dd>
                    </div>
                    <div>
                      <dt>Talento delle origini</dt>
                      <dd>{{ regola.schedaBackground.talento }}</dd>
                    </div>
                    <div>
                      <dt>Competenze nelle abilità</dt>
                      <dd>{{ regola.schedaBackground.abilita.join(', ') }}</dd>
                    </div>
                    <div>
                      <dt>Competenza negli strumenti</dt>
                      <dd>{{ regola.schedaBackground.strumenti }}</dd>
                    </div>
                  </dl>
                  <p>
                    <strong>Equipaggiamento A:</strong>
                    {{ regola.schedaBackground.equipaggiamentoA }}
                  </p>
                  <p>
                    <strong>Equipaggiamento B:</strong>
                    {{ regola.schedaBackground.equipaggiamentoB }}
                  </p>
                </div>
                <div v-if="regola.descrizioneOrigine" class="compendio-estratto-specie">
                  <h4>Testo della descrizione SRD</h4>
                  <TestoCompendioSRD :testo="regola.descrizioneOrigine" :etichetta="'Origine ' + regola.nome" />
                </div>
                <div v-if="regola.schedaSpecie" class="compendio-estratto-specie">
                  <small
                    >Metadati verificati sul PDF SRD 5.2.1 · descrizioni dei tratti ancora da
                    revisionare</small
                  >
                  <dl class="compendio-scheda-incantesimo">
                    <div>
                      <dt>Tipo di creatura</dt>
                      <dd>{{ regola.schedaSpecie.tipoCreatura }}</dd>
                    </div>
                    <div>
                      <dt>Taglia</dt>
                      <dd>{{ regola.schedaSpecie.taglie.join(' / ') }}</dd>
                    </div>
                    <div>
                      <dt>Velocità</dt>
                      <dd>{{ regola.schedaSpecie.velocitaMetri }} metri</dd>
                    </div>
                    <div>
                      <dt>Pagine SRD</dt>
                      <dd>{{ regola.schedaSpecie.pagine.join(', ') }}</dd>
                    </div>
                  </dl>
                  <strong>Tratti della specie</strong>
                  <p class="compendio-nota">
                    Sono inclusi gli effetti descritti nell'SRD, oltre all'indice dei tratti.
                    Le trascrizioni automatiche richiedono ancora la revisione editoriale.
                  </p>
                  <TestoCompendioSRD
                    v-if="regola.descrizioneSpecie"
                    :testo="regola.descrizioneSpecie"
                    :etichetta="'Tratti della specie ' + regola.nome"
                  />
                  <ul v-else>
                    <li v-for="tratto in regola.schedaSpecie.tratti" :key="tratto">{{ tratto }}</li>
                  </ul>
                  <div v-if="regola.schedaSpecie.opzioni.length" class="compendio-opzioni-specie">
                    <strong>Opzioni di lignaggio e discendenza</strong>
                    <ul>
                      <li v-for="opzione in regola.schedaSpecie.opzioni" :key="opzione.nome">
                        <strong>{{ opzione.nome }}</strong>
                        <span v-if="opzione.danno"> · Danno: {{ opzione.danno }}</span>
                        <span v-if="opzione.origine"> · {{ opzione.origine }}</span>
                        <span v-if="opzione.livello1"> · Livello 1: {{ opzione.livello1 }}</span>
                        <span v-if="opzione.livello3"> · Livello 3: {{ opzione.livello3 }}</span>
                        <span v-if="opzione.livello5"> · Livello 5: {{ opzione.livello5 }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <dl
                  v-if="
                    regola.categoria === 'Incantesimi' &&
                    (regola.verificato || regola.dettagliCompleti)
                  "
                  class="compendio-scheda-incantesimo"
                >
                  <div>
                    <dt>Tempo di lancio</dt>
                    <dd>{{ regola.tempoLancio }}</dd>
                  </div>
                  <div>
                    <dt>Gittata</dt>
                    <dd>{{ regola.gittata }}</dd>
                  </div>
                  <div>
                    <dt>Componenti</dt>
                    <dd>{{ regola.componenti }}</dd>
                  </div>
                  <div>
                    <dt>Durata</dt>
                    <dd>{{ regola.durata }}</dd>
                  </div>
                </dl>
                <p v-if="regola.categoria === 'Incantesimi'" class="compendio-metadata">
                  <strong>Scuola:</strong> {{ regola.scuola }} · <strong>Livello:</strong>
                  {{ regola.livello === 0 ? 'Trucchetto' : regola.livello }}
                </p>
                <small>SRD 5.2.1 italiano · riferimento PDF: pagina {{ regola.pagina }}</small>
                <div
                  v-if="['Classi', 'Origini', 'Regole', 'Condizioni'].includes(regola.categoria)
                    && !regola.dettagliCompleti
                    && !regola.descrizioneClasse
                    && !regola.descrizioneOrigine"
                  class="compendio-fonte"
                  aria-live="polite"
                >
                  <p v-if="caricamentoFonte && voceFonte === regola.id" role="status">
                    Caricamento del contenuto pertinente…
                  </p>
                  <p v-else-if="erroreFonte && voceFonte === regola.id" role="status" class="compendio-nota">
                    {{ erroreFonte }}
                  </p>
                  <TestoCompendioSRD
                    v-else-if="testoFonte && voceFonte === regola.id && aperta === regola.id"
                    :testo="testoFonte"
                    :etichetta="'Testo SRD di ' + regola.nome"
                  />
                </div>
              </div>
            </details>
          </template>
          <nav
            v-if="pagineTotali > 1"
            class="compendio-paginazione"
            aria-label="Pagine dei risultati"
          >
            <button type="button" :disabled="pagina === 1" @click="pagina--">Precedente</button
            ><span>Pagina {{ pagina }} di {{ pagineTotali }}</span
            ><button type="button" :disabled="pagina === pagineTotali" @click="pagina++">
              Successiva
            </button>
          </nav>
          <p v-if="!risultati.length" class="compendio-vuoto">
            Nessuna voce corrispondente. Le categorie con zero voci non sono ancora state popolate.
          </p>
        </div>
      </section>
    </div>
    <footer class="compendio-attribuzione">
      Quest'opera include materiale tratto dal System Reference Document 5.2.1 ("SRD 5.2.1") di
      Wizards of the Coast LLC, disponibile all'indirizzo https://www.dndbeyond.com/srd. Il SRD
      5.2.1 è concesso in licenza ai sensi della licenza di attribuzione 4.0 Internazionale di
      Creative Commons, disponibile all'indirizzo
      https://creativecommons.org/licenses/by/4.0/legalcode. Le sintesi non sostituiscono il testo
      originale.
    </footer>
  </main>
</template>

<style scoped>
.compendio-pagina {
  padding-top: 38px;
  padding-bottom: 65px;
}
.compendio-eroe {
  max-width: 900px;
  margin: 0 auto 34px;
  text-align: center;
}
.compendio-sopratitolo {
  color: #e5a65c;
  letter-spacing: 0.14em;
  font-size: 11px;
  font-weight: 700;
}
.compendio-eroe h1 {
  margin: 10px 0;
  color: #e5a65c;
  font-size: clamp(34px, 5vw, 56px);
}
.compendio-eroe p {
  margin: 0 auto 23px;
  max-width: 620px;
  line-height: 1.6;
  color: #b8c2ca;
}
.compendio-ricerca input {
  width: 100%;
  padding: 15px 18px;
  border: 1px solid #64727c;
  border-radius: 12px;
  background: #101e2a;
  color: #f6eee2;
  font: inherit;
}
.compendio-categorie {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}
.compendio-categoria {
  display: grid;
  gap: 7px;
  text-align: left;
  padding: 19px;
  border: 1px solid #53616c;
  border-radius: 13px;
  cursor: pointer;
  background: #242d38;
  color: #f6eee2;
  font: inherit;
}
.compendio-categoria:hover {
  border-color: #e5a65c;
}
.compendio-categoria-titolo {
  color: #e5a65c;
  font-weight: 700;
}
.compendio-categoria-titolo small {
  margin-left: 5px;
  color: #c8d1d8;
}
.compendio-categoria-descrizione {
  color: #b8c2ca;
  font-size: 12px;
  line-height: 1.5;
}
.compendio-layout {
  display: grid;
  grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}
.compendio-filtri {
  padding: 20px;
  border: 1px solid #53616c;
  border-radius: 14px;
}
.compendio-filtri-testa {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.compendio-filtri h2,
.compendio-barra h2 {
  margin: 0;
  font-size: 20px;
  color: #e5a65c;
}
.compendio-filtri-testa button {
  border: 0;
  background: none;
  color: #c8d1d8;
  text-decoration: underline;
  cursor: pointer;
}
.compendio-filtri fieldset {
  border: 0;
  border-top: 1px solid #53616c;
  padding: 18px 0 0;
  margin: 17px 0 0;
  display: grid;
  gap: 12px;
}
.compendio-filtri legend {
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  padding-top: 10px;
}
.compendio-filtri label {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  cursor: pointer;
}
.compendio-filtri input {
  accent-color: #e5a65c;
}
.compendio-filtri label small {
  color: #aab8c4;
}
.compendio-nota {
  margin: 20px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #b8c2ca;
}
.compendio-barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.compendio-barra small {
  color: #b8c2ca;
}
.compendio-barra label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.compendio-barra select {
  padding: 9px;
  border: 1px solid #64727c;
  border-radius: 8px;
  background: #101e2a;
  color: #f6eee2;
}
.compendio-elenco {
  display: grid;
  gap: 10px;
}
.compendio-voce {
  border: 1px solid #53616c;
  border-radius: 12px;
  overflow: hidden;
}
.compendio-voce summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
}
.compendio-voce summary span:first-child {
  display: grid;
  gap: 4px;
}
.compendio-voce strong {
  color: #e5a65c;
}
.compendio-voce summary small,
.compendio-testo small {
  color: #b8c2ca;
  font-size: 12px;
}
.compendio-testo {
  padding: 0 20px 20px;
  line-height: 1.7;
}
.compendio-testo p {
  margin: 0 0 12px;
}
.compendio-vuoto {
  padding: 24px;
  border: 1px dashed #64727c;
  border-radius: 12px;
  color: #b8c2ca;
}
.compendio-attribuzione {
  margin-top: 30px;
  color: #b8c2ca;
  font-size: 12px;
  line-height: 1.6;
}
.compendio-pagina :is(button, input, select, summary):focus-visible {
  outline: 3px solid #e5a65c;
  outline-offset: 3px;
}
@media (max-width: 1000px) {
  .compendio-categorie {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 680px) {
  .compendio-layout {
    grid-template-columns: 1fr;
  }
  .compendio-categorie {
    grid-template-columns: 1fr 1fr;
  }
  .compendio-pagina {
    padding-top: 24px;
  }
}
@media (max-width: 430px) {
  .compendio-categorie {
    grid-template-columns: 1fr;
  }
}
.compendio-metadata {
  font-size: 13px;
  color: #c8d1d8;
}
.compendio-paginazione {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px;
}
.compendio-paginazione button {
  padding: 9px 14px;
  background: #242d38;
  border: 1px solid #64727c;
  border-radius: 8px;
  color: #f6eee2;
  cursor: pointer;
}
.compendio-paginazione button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.compendio-scheda-incantesimo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}
.compendio-scheda-incantesimo div {
  padding: 12px;
  border: 1px solid #53616c;
  border-radius: 8px;
}
.compendio-scheda-incantesimo dt {
  color: #e5a65c;
  font-size: 12px;
  font-weight: 700;
}
.compendio-scheda-incantesimo dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
}
.compendio-opzione-dettagli {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 18px;
  font-size: 12px;
  line-height: 1.5;
}
@media (max-width: 430px) {
  .compendio-scheda-incantesimo {
    grid-template-columns: 1fr;
  }
}
.compendio-descrizione {
  white-space: pre-line;
}
.compendio-fonte {
  margin-top: 12px;
}
.compendio-fonte button {
  background: none;
  border: 1px solid #64727c;
  color: #e5a65c;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.compendio-fonte pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  font-size: 13px;
  line-height: 1.65;
  padding: 14px;
  background: #101e2a;
  border: 1px solid #53616c;
  border-radius: 9px;
  max-height: 500px;
  overflow: auto;
}
.compendio-estratto-specie {
  margin: 12px 0 16px;
}
.compendio-estratto-specie pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  font-size: 13px;
  line-height: 1.65;
  padding: 14px;
  background: #101e2a;
  border: 1px solid #53616c;
  border-radius: 9px;
  max-height: 560px;
  overflow: auto;
}
</style>
