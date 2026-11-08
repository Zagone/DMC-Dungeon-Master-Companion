# Asset Crooked Realms R4

Asset originali prodotti con Imagegen integrato, usando l'UI Kit R4 allegato come riferimento stilistico. Non sono ritagli della tavola composita. La conversione tecnica elimina il margine trasparente esterno e produce WebP con alpha; non incorpora testo o icone.

| File | Dimensioni | Uso |
| --- | --- | --- |
| `cornice-ardesia.webp` | 800 × 998 | Cornice card, nove parti, slice 190, angoli renderizzati a 45 px |
| `placca-ambra.webp` | 1000 × 189 | CTA primaria, nove parti, slice 32 / 130 / 36 / 130 |
| `placca-ardesia.webp` | 1000 × 186 | CTA secondaria e recenti, stessa suddivisione |
| `traversa-ardesia.svg` | viewBox 600 × 22 | Separatore immagine/contenuto, SVG originale scritto per R4 |

Gli angoli fissi non impongono un'altezza alla card. Il centro della cornice sovrapposta viene scartato, lasciando visibile l'immagine dinamica. Le placche usano `fill` per la texture centrale; il testo può andare a capo e aumentare l'altezza. Cornici e texture ignorano gli eventi del puntatore. Il focus resta esterno e non viene ritagliato.

Freccia, lucchetto, cronometro e dado sono SVG nei componenti UI: non dipendono da glifi del sistema. Nessuna CTA usa la spirale romboidale. Le illustrazioni dei contenuti e il panorama originali R3 sono conservati senza modifiche.

## Prompt delle tre generazioni

Prompt comune, sfondo trasparente, riferimento: UI Kit R4 illustrato allegato.

> Production UI asset for Crooked Realms R4, matching the simpler hand-painted slate UI kit reference. Reference image is only for artistic language, do NOT reproduce the sheet. Original stand-alone asset, not a crop. Dominant SLATE STONE #242D38, thick near-black ink contour, charcoal shadows, sparse broad gouache brush planes, irregular playful chipped silhouette. Matte illustrated cartoon stone, not realistic stone, not wood, no photorealism, no metallic gloss. Deliberate asymmetry of shapes with FEW details. Genuinely transparent outside. NO text, NO letters, NO numbers, NO symbols, NO spirals, NO diamond motifs, NO arrows, NO rivets, NO banners, NO lanterns. Clean antialiased edges, complete unclipped object.

Cornice:

> One EMPTY rectangular card frame, portrait proportion about 4:5, nearly frontal view, four subtly different hand-chipped corners and uneven stone bevels, a narrow consistent frame about 5 percent of total width. A few small warm amber #E5A65C chips at only two corners, NOT a continuous gold border. Mostly dark slate and restrained grey bevel highlights. The open interior is a single plain dark #242D38 rectangle (no image, no internal horizontal bar, no inner text panel). The outer shape is near rectangular with angular softened chipped corners, slight crookedness; avoid ornate fantasy carving. One frame only, centered on transparency with modest margin. Designed for CSS nine-slice: keep corner details confined within the outer 15 percent at each corner and keep long edges quiet and relatively straight so they can stretch. The central area must be entirely plain. Shape personality more important than texture detail.

Placca primaria:

> One wide horizontal PRIMARY BUTTON plaque, about 6:1 object width to height. Flat warm AMBER #E5A65C painted stone face, with a very thin dark slate beveled edge and black ink outline, a few broad understated brush marks and a tiny chipped notch. Both short ends are slanted irregular polygonal cuts, not perfect round corners. Wide plain empty middle for real HTML label. One plaque only, frontal, centered on transparent canvas. Very simple, low detail. Not wood, not parchment. No arrow or text. Keep end details within 15 percent of width, ready for nine-slice scaling.

Placca secondaria:

> One wide horizontal SECONDARY BUTTON plaque, about 6:1 object width to height. Flat dark SLATE #242D38 painted stone face, thin grey uneven bevel and bold black ink outline, very sparse broad brush texture, one tiny chipped notch. Both short ends are slanted irregular polygonal cuts, not perfect round corners. Plain empty middle for real cream HTML label. No amber edging on this secondary plaque, only slate stone. One plaque only, frontal, centered on transparent canvas. Very simple low detail. No arrow or text. Keep end details within 15 percent of width, ready for nine-slice scaling.

## Estensione R4.1

`pannello-operativo.svg` è un nuovo bordo vettoriale sobrio, scritto per le schermate operative: viewBox 120 × 120, centro trasparente, suddivisione 17 e bordo di 11 px. Il colore centrale è definito dal CSS per preservare il contrasto. Le tre immagini WebP R4 sono riutilizzate senza modifiche. I materiali condivisi risiedono in `design-system.css`; nei componenti rimangono layout e comportamento.
