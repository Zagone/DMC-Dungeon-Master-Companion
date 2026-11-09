// Voci introduttive verificate sul Glossario delle regole dell'SRD italiano 5.2.1.
// Le descrizioni sono sintesi editoriali: per il testo normativo consultare il PDF.
export const REGOLE_SRD = Object.freeze([
  { id:'condizione-accecato', nome:'Accecato', categoria:'Condizioni', pagina:201, sintesi:'Non può vedere; fallisce automaticamente le prove che richiedono la vista. I suoi attacchi hanno svantaggio e quelli contro di lui vantaggio.' },
  { id:'condizione-affascinato', nome:'Affascinato', categoria:'Condizioni', pagina:201, sintesi:'Non può attaccare né danneggiare chi lo ha affascinato; quest’ultimo ha vantaggio alle prove per interagire socialmente con lui.' },
  { id:'condizione-afferrato', nome:'Afferrato', categoria:'Condizioni', pagina:202, sintesi:'Velocità pari a zero; svantaggio agli attacchi contro bersagli diversi da chi lo afferra. Chi lo afferra può trascinarlo con un costo di movimento aggiuntivo, salvo eccezioni di taglia.' },
  { id:'condizione-assordato', nome:'Assordato', categoria:'Condizioni', pagina:203, sintesi:'Non può sentire e fallisce automaticamente le prove che richiedono l’udito.' },
  { id:'condizione-avvelenato', nome:'Avvelenato', categoria:'Condizioni', pagina:203, sintesi:'Svantaggio ai tiri per colpire e alle prove di caratteristica.' },
  { id:'condizione-prono', nome:'Prono', categoria:'Condizioni', pagina:212, sintesi:'Può strisciare o rialzarsi spendendo metà della velocità. Ha svantaggio agli attacchi; gli attacchi contro di lui hanno vantaggio entro 1,5 m e svantaggio oltre.' },
  { id:'condizione-spaventato', nome:'Spaventato', categoria:'Condizioni', pagina:216, sintesi:'Svantaggio alle prove e agli attacchi finché vede la fonte della paura; non può avvicinarsi volontariamente a essa.' }
])
export function cercaRegole(testo='', categoria='') {
  const q=String(testo).toLocaleLowerCase('it-IT').trim()
  return REGOLE_SRD.filter(r=>(!categoria||r.categoria===categoria)&&(!q||[r.nome,r.sintesi].some(t=>t.toLocaleLowerCase('it-IT').includes(q))))
}
