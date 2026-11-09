// Indice dei 339 incantesimi ricavato dalle intestazioni delle descrizioni
// dell'SRD italiano 5.2.1, pp. 121–201. Non include ancora il testo completo.
// Campi: nome | livello (0=trucchetto) | scuola | pagina stampata.
const RIGHE = `Aculeo mentale|2|Divinazione|121
Aiuto|2|Abiurazione|121
Allarme|1|Abiurazione|122
Alleato planare|6|Evocazione|122
Allucinazione di forza|2|Illusione|122
Allucinazione mortale|4|Illusione|123
Amicizia con gli animali|1|Ammaliamento|123
Anatema|1|Ammaliamento|123
Animale messaggero|2|Ammaliamento|123
Alterare se stesso|2|Trasmutazione|123
Animare morti|3|Necromanzia|124
Animare oggetti|5|Trasmutazione|124
Anti-individuazione|3|Abiurazione|125
Antipatia/simpatia|8|Ammaliamento|125
Arma magica|2|Trasmutazione|125
Arma spirituale|2|Invocazione|125
Armatura magica|1|Abiurazione|126
Artificio druidico|0|Trasmutazione|126
Aura di vita|4|Abiurazione|126
Aura magica dell'arcanista|2|Illusione|126
Aura sacra|8|Abiurazione|126
Bacche benefiche|1|Evocazione|127
Bagliore lunare|2|Invocazione|127
Bagliore solare|6|Invocazione|127
Banchetto degli eroi|6|Evocazione|127
Barriera di lame|6|Invocazione|127
Beffa crudele|0|Ammaliamento|128
Benedizione|1|Ammaliamento|128
Blocca mostri|5|Ammaliamento|128
Blocca persone|2|Ammaliamento|128
Bocca magica|2|Illusione|128
Caduta morbida|1|Trasmutazione|129
Calmare emozioni|2|Ammaliamento|129
Camminare nel vento|6|Trasmutazione|129
Camminare sull'acqua|3|Trasmutazione|129
Campo anti-magia|8|Abiurazione|129
Camuffare se stesso|1|Illusione|130
Capanna|3|Invocazione|130
Caratteristica potenziata|2|Trasmutazione|130
Carne in pietra|6|Trasmutazione|130
Catena di fulmini|6|Invocazione|131
Cecità/sordità|2|Trasmutazione|131
Celare|7|Trasmutazione|131
Cerchio di morte|6|Necromanzia|131
Cerchio di teletrasporto|5|Evocazione|131
Cerchio magico|3|Abiurazione|132
Charme sui mostri|4|Ammaliamento|132
Charme su persone|1|Ammaliamento|132
Chiaroveggenza|3|Divinazione|132
Clone|8|Necromanzia|133
Colpo accurato|0|Divinazione|133
Colpo infuocato|5|Invocazione|133
Colpo intrappolante|1|Evocazione|133
Coltello di ghiaccio|1|Evocazione|133
Comando|1|Ammaliamento|134
Comprensione dei linguaggi|1|Divinazione|134
Compulsione|4|Ammaliamento|134
Comunione|5|Divinazione|134
Comunione con la natura|5|Divinazione|134
Confusione|4|Ammaliamento|135
Cono di freddo|5|Invocazione|135
Conoscenza delle leggende|5|Divinazione|135
Contagio|5|Necromanzia|135
Contattare altri piani|5|Divinazione|136
Contingenza|6|Abiurazione|136
Controincantesimo|3|Abiurazione|136
Controllare acqua|4|Trasmutazione|136
Controllare tempo atmosferico|8|Trasmutazione|137
Costrizione|5|Ammaliamento|137
Creare cibo e acqua|3|Evocazione|138
Creare non morti|6|Necromanzia|138
Creare o distruggere acqua|1|Trasmutazione|138
Creazione|5|Illusione|138
Crescita di spine|2|Trasmutazione|139
Crescita vegetale|3|Trasmutazione|139
Cura ferite|1|Abiurazione|139
Cura ferite di massa|5|Abiurazione|139
Danza irresistibile|6|Ammaliamento|139
Dardo di fuoco|0|Invocazione|140
Dardo incantato|1|Invocazione|140
Dardo tracciante|1|Invocazione|140
Deflagrazione occulta|0|Invocazione|140
Desiderio|9|Evocazione|140
Destriero fantomatico|3|Illusione|141
Disco fluttuante|1|Evocazione|141
Disintegrazione|6|Trasmutazione|142
Disorientare|8|Ammaliamento|142
Dissolvi il bene e il male|5|Abiurazione|142
Dissolvi magie|3|Abiurazione|142
Dito della morte|7|Necromanzia|143
Divinazione|4|Divinazione|143
Dominare bestie|4|Ammaliamento|143
Dominare mostri|8|Ammaliamento|143
Dominare persone|5|Ammaliamento|143
Elementalismo|0|Trasmutazione|144
Eroismo|1|Ammaliamento|144
Esilio|4|Abiurazione|144
Evoca celestiale|7|Evocazione|145
Evoca creature boschive|4|Evocazione|145
Esplosione solare|8|Invocazione|145
Estasiare|2|Ammaliamento|145
Evoca animali|3|Evocazione|145
Evoca elementale|5|Evocazione|146
Evoca elementali minori|4|Evocazione|146
Evoca folletto|6|Evocazione|146
Evocazioni istantanee|6|Evocazione|146
Fabbricare|4|Trasmutazione|147
Faro di speranza|3|Abiurazione|147
Fatale|9|Illusione|147
Favore divino|1|Trasmutazione|147
Ferire|6|Necromanzia|147
Fermare il tempo|9|Trasmutazione|147
Fiamma perenne|2|Invocazione|148
Fiamma sacra|0|Invocazione|148
Fiotto acido|0|Invocazione|148
Folata di vento|2|Invocazione|148
Fondersi nella pietra|3|Trasmutazione|148
Forma eterea|7|Evocazione|149
Forma gassosa|3|Trasmutazione|149
Forme animali|8|Trasmutazione|149
Frantumare|2|Invocazione|150
Freccia acida|2|Invocazione|150
Fulmine|3|Invocazione|150
Fuorviare|5|Illusione|150
Gabbia di forza|7|Invocazione|150
Giara magica|6|Necromanzia|151
Glifo di interdizione|3|Abiurazione|151
Globo cromatico|1|Invocazione|152
Globo di invulnerabilità|6|Abiurazione|152
Guardiani spirituali|3|Evocazione|152
Guardiano della fede|4|Evocazione|153
Guarigione|6|Abiurazione|153
Guarigione di massa|9|Abiurazione|153
Guida|0|Divinazione|153
Guscio anti-vita|5|Abiurazione|153
Identificare|1|Divinazione|153
Illusione minore|0|Illusione|153
Illusione programmata|6|Illusione|154
Immagine maggiore|3|Illusione|154
Immagine proiettata|7|Illusione|154
Immagine silenziosa|1|Illusione|155
Immagine speculare|2|Illusione|155
Imprigionare|9|Abiurazione|155
Inaridire|4|Necromanzia|156
Individuazione dei pensieri|2|Divinazione|156
Individuazione del bene e del male|1|Divinazione|156
Individuazione delle malattie e dei veleni|1|Divinazione|156
Individuazione del magico|1|Divinazione|157
Infliggi ferite|1|Necromanzia|157
Ingrandire/ridurre|2|Trasmutazione|157
Insetto gigante|4|Evocazione|157
Interdizione alla morte|4|Abiurazione|158
Intermittenza|3|Trasmutazione|158
Intimorire infernale|1|Invocazione|158
Intralciare|1|Evocazione|158
Inversione della gravità|7|Trasmutazione|159
Inviare|3|Divinazione|159
Invisibilità|2|Illusione|159
Invisibilità superiore|4|Illusione|159
Invocare il fulmine|3|Evocazione|159
Labirinto|8|Evocazione|160
Lama infuocata|2|Invocazione|160
Legame planare|5|Abiurazione|160
Legame telepatico|5|Divinazione|160
Lentezza|3|Trasmutazione|161
Levitazione|2|Trasmutazione|161
Libertà di movimento|4|Abiurazione|161
Linguaggi|3|Divinazione|161
Localizza animali o vegetali|2|Divinazione|161
Localizza creatura|4|Divinazione|162
Localizza oggetto|2|Divinazione|162
Loquacità|8|Ammaliamento|162
Luce|0|Invocazione|162
Luce diurna|3|Invocazione|162
Luce splendente|0|Invocazione|162
Luci danzanti|0|Illusione|163
Luminescenza|1|Invocazione|163
Mani brucianti|1|Invocazione|163
Mano arcana|5|Invocazione|163
Mano magica|0|Evocazione|164
Marchio del cacciatore|1|Divinazione|164
Messaggio|0|Trasmutazione|164
Metamorfosi|4|Trasmutazione|164
Metamorfosi pura|9|Trasmutazione|165
Miraggio arcano|7|Illusione|165
Modificare memoria|5|Ammaliamento|165
Movimenti del ragno|2|Trasmutazione|166
Muovere il terreno|6|Trasmutazione|166
Muro di forza|5|Invocazione|166
Muro di fuoco|4|Invocazione|167
Muro di ghiaccio|6|Invocazione|167
Muro di pietra|5|Invocazione|167
Muro di spine|6|Evocazione|168
Muro di vento|3|Invocazione|168
Muro prismatico|9|Abiurazione|168
Nube di nebbia|1|Evocazione|169
Nube incendiaria|8|Evocazione|169
Nube maleodorante|3|Evocazione|170
Nube mortale|5|Evocazione|170
Occhio arcano|4|Divinazione|170
Onda tonante|1|Invocazione|170
Oscurità|2|Invocazione|170
Palla di fuoco|3|Invocazione|171
Palla di fuoco ritardata|7|Invocazione|171
Parlare con gli animali|1|Divinazione|171
Parlare con i morti|3|Necromanzia|171
Parlare con i vegetali|3|Trasmutazione|171
Parola del potere guarire|9|Ammaliamento|172
Parola del potere stordire|8|Ammaliamento|172
Parola del potere uccidere|9|Ammaliamento|172
Parola del ritiro|6|Evocazione|172
Parola divina|7|Invocazione|172
Parola guaritrice|1|Abiurazione|173
Parola guaritrice di massa|3|Abiurazione|173
Passapareti|5|Trasmutazione|173
Passare senza tracce|2|Abiurazione|173
Passo velato|2|Evocazione|173
Passo veloce|1|Trasmutazione|173
Paura|3|Illusione|173
Pelle coriacea|2|Trasmutazione|173
Pelle di pietra|4|Trasmutazione|174
Piaga degli insetti|5|Evocazione|174
Porta dimensionale|4|Evocazione|174
Portale|9|Evocazione|174
Preghiera di guarigione|2|Abiurazione|174
Presagio|2|Divinazione|175
Prestidigitazione|0|Trasmutazione|175
Previsione|9|Divinazione|175
Produrre fiamma|0|Evocazione|175
Proibizione|6|Abiurazione|176
Proiezione astrale|9|Necromanzia|176
Protezione dai veleni|2|Abiurazione|176
Protezione dal bene e dal male|1|Abiurazione|176
Protezione dall'energia|3|Abiurazione|177
Punizione divina|1|Invocazione|177
Punizione incandescente|1|Invocazione|177
Punizione splendente|2|Trasmutazione|177
Purificare cibo e bevande|1|Trasmutazione|177
Raggio di affaticamento|2|Necromanzia|177
Raggio di gelo|0|Invocazione|177
Raggio di infermità|1|Necromanzia|178
Raggio rovente|2|Invocazione|178
Ragnatela|2|Evocazione|178
Randello incantato|0|Trasmutazione|178
Reggia meravigliosa|7|Evocazione|178
Reincarnazione|5|Necromanzia|179
Resistenza|0|Abiurazione|179
Respirare sott'acqua|3|Trasmutazione|179
Resurrezione|7|Necromanzia|179
Resurrezione pura|9|Necromanzia|180
Rianimare morti|5|Necromanzia|180
Richiama drago|5|Evocazione|180
Rigenerazione|7|Trasmutazione|181
Rimuovi maledizione|3|Abiurazione|181
Rinascita|3|Necromanzia|181
Riparare|0|Trasmutazione|181
Riposo inviolato|2|Necromanzia|181
Risata incontenibile|1|Ammaliamento|181
Riscaldare il metallo|2|Trasmutazione|181
Ristorare inferiore|2|Abiurazione|182
Ristorare superiore|5|Abiurazione|182
Risveglio|5|Trasmutazione|182
Ritirata rapida|1|Trasmutazione|182
Salto|1|Trasmutazione|182
Salvare i morenti|0|Necromanzia|182
Santificare|5|Abiurazione|183
Santuario|1|Abiurazione|183
Santuario privato|4|Abiurazione|183
Scagliare maledizione|3|Necromanzia|184
Scassinare|2|Trasmutazione|184
Sciame di meteore|9|Invocazione|184
Scolpire pietra|4|Trasmutazione|184
Scopri il percorso|6|Divinazione|184
Scopri trappole|2|Divinazione|185
Scrigno segreto|4|Evocazione|185
Scritto illusorio|1|Illusione|185
Scrutare|5|Divinazione|185
Scudo|1|Abiurazione|186
Scudo della fede|1|Abiurazione|186
Scudo di fuoco|4|Invocazione|186
Scurovisione|2|Trasmutazione|186
Segugio fedele|4|Evocazione|186
Sembrare|5|Illusione|187
Semipiano|8|Evocazione|187
Serratura arcana|2|Abiurazione|187
Servitore inosservato|1|Evocazione|187
Sfera al vetriolo|4|Invocazione|188
Sfera congelante|6|Invocazione|188
Sfera elastica|4|Abiurazione|188
Sfera infuocata|2|Evocazione|188
Sfocatura|2|Illusione|189
Sguardo penetrante|6|Necromanzia|189
Silenzio|2|Illusione|189
Simbolo|7|Abiurazione|189
Simulacro|7|Illusione|190
Soffio del drago|2|Trasmutazione|190
Sogno|5|Illusione|190
Sonno|1|Ammaliamento|191
Sortilegio|1|Ammaliamento|191
Spada arcana|7|Invocazione|191
Spostamento planare|7|Evocazione|191
Spruzzo colorato|1|Illusione|191
Spruzzo prismatico|7|Invocazione|192
Spruzzo velenoso|0|Necromanzia|192
Stregoneria esplosiva|0|Invocazione|192
Stretta folgorante|0|Invocazione|192
Suggestione|2|Ammaliamento|192
Suggestione di massa|6|Ammaliamento|193
Sussurri dissonanti|1|Ammaliamento|193
Taumaturgia|0|Trasmutazione|193
Telecinesi|5|Trasmutazione|193
Teletrasporto|7|Evocazione|194
Tempesta di fuoco|7|Invocazione|195
Tempesta di ghiaccio|4|Invocazione|195
Tempesta di nevischio|3|Evocazione|195
Tempesta di vendetta|9|Evocazione|195
Tentacoli neri|4|Evocazione|195
Terremoto|8|Trasmutazione|196
Terreno illusorio|4|Illusione|196
Tocco del vampiro|3|Necromanzia|196
Tocco gelido|0|Necromanzia|197
Trama ipnotica|3|Illusione|197
Trasformazione|9|Trasmutazione|197
Traslazione arborea|5|Evocazione|197
Trasporto vegetale|6|Evocazione|197
Trova cavalcatura|2|Evocazione|198
Trova famiglio|1|Evocazione|198
Trucco della corda|2|Trasmutazione|199
Tsunami|8|Evocazione|199
Unto|1|Evocazione|199
Vedere invisibilità|2|Divinazione|200
Velocità|3|Trasmutazione|200
Vigilanza e interdizione|6|Abiurazione|200
Vincolo di interdizione|2|Abiurazione|200
Visione del vero|6|Divinazione|201
Vita falsata|1|Necromanzia|201
Volare|3|Trasmutazione|201
Vuoto mentale|8|Abiurazione|201
Zona di verità|2|Ammaliamento|201`
export const INCANTESIMI_SRD = Object.freeze(RIGHE.trim().split('\n').map((riga, indice) => {
  const [nome, livello, scuola, pagina] = riga.split('|')
  return Object.freeze({ id: 'incantesimo-' + String(indice + 1).padStart(3,'0'),
    nome, categoria: 'Incantesimi', livello: Number(livello), scuola,
    pagina: Number(pagina), sintesi: 'Consulta la descrizione ufficiale nel documento SRD 5.2.1.',
    dettagliCompleti: false })
}))
