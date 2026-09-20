# CLAUDE.md — Contexte du projet `etude-jw`

Ce fichier donne à Claude Code le contexte nécessaire pour travailler sur ce dépôt sans avoir à tout réexpliquer à chaque session.

## Vue d'ensemble du projet

PWA (Progressive Web App) d'étude biblique personnelle, hébergée sur **GitHub Pages** (`chmicmoreau-source/etude-jw`, branche `main`).

**Un seul fichier applicatif : `index.html`.** C'est une PWA installable (manifeste `manifest.json`, service worker `sw.js`, icônes dans `icons/`) à 5 onglets : Accueil, Études, JW Notes, Sync, Réunion. Le module Réunion (préparation autonome de la réunion « Vie et ministère chrétiens », avec récupération dynamique du programme depuis wol.jw.org) vivait auparavant dans un fichier séparé (`etude-reunion-semaine.html`) ; il a été fusionné dans `index.html` pour n'avoir qu'une seule application à installer. Sa logique JS est isolée dans sa propre IIFE et son CSS scopé sous `#s-reunion` pour ne pas interférer avec le reste de l'app.

## Sources doctrinales autorisées

**Strictement limité à :**
- JW.org
- wol.jw.org
- JW Library
- Traduction du monde nouveau (TMN)

Aucune source extérieure à l'organisation ne doit être utilisée pour du contenu doctrinal.

**Règle permanente pour tout contenu d'étude biblique généré par Claude :**
> Toujours inclure le texte complet des versets cités selon la TMN — jamais seulement la référence.

## Contraintes techniques impératives

Ces règles viennent d'une compatibilité Android Chrome testée et doivent être respectées dans tout le code :

| Contrainte | Détail |
|---|---|
| **Pas de framework** | HTML/CSS/JavaScript pur — pas de React, pas de Babel |
| **Pas de template literals** | Utiliser la concaténation avec guillemets doubles (`"a" + b + "c"`), pas de `` `${x}` `` |
| **Timeout réseau** | Utiliser `Promise.race` plutôt que `AbortSignal.timeout` (non supporté sur certains Android) |
| **ColorIndex JW Library** | Maximum 6 — `ColorIndex = 7` fait planter JW Library sur Android |
| **Notes autonomes JW Library** | Nécessitent `UserMarkId = NULL` dans l'export JSON |
| **Export JSON** | Respecter les plafonds précis des paramètres d'export JW Library (à vérifier avant toute génération) |

## Architecture de `index.html` (onglets réels, à jour 2026-07)

- **Accueil** — recherche WOL/JW.ORG/JW Library, liens rapides vers la Bibliothèque Watchtower, raccourcis « Modules d'étude » vers les onglets du bas (Études, Sang, Réunion, Sujet, MCAD).
- **Études** — historique des études générées (résumé, plan en points, questions de réflexion), filtrable par catégorie ; inclut aussi la grille des thèmes bibliques suggérés (22 sujets classés par catégorie, `SUGGS`) déclenchant une étude IA — déplacée ici depuis l'accueil en 2026-07-21.
- **JW Notes** — import d'un export `.jwlibrary` (zip + SQLite, décodé en local via JSZip + sql.js) pour consulter ses notes JW Library dans l'app.
- **Sync** — connexion GitHub (Gist privé) pour synchroniser l'historique des études entre appareils ; carte de génération IA retirée (voir plus bas).
- **Réunion** — préparation de la réunion de semaine (voir section dédiée).
- **Sang** — « Sang & traitements » : base scripturaire (`BLOOD_DOCTRINE`), principes de décision personnelle (`BLOOD_PRINCIPLES`), fiche de décisions par produit/procédé (`BLOOD_ITEMS`) et liens officiels (`BLOOD_LINKS`). **Les décisions de l'utilisateur (`G.bloodChoices`, clé `jw_dbx_v1bloodChoices`, et le texte libre `jw_dbx_v1blood`) restent strictement locales : jamais envoyées au Gist, jamais écrites dans le dépôt.** Mis à jour le 2026-09-20 d'après le Point actualité n° 6 du Collège central (18 sept. 2026) — voir section dédiée.
- **Sujet** — suivi des discours / démonstrations / devoirs en préparation (`G.sujets`), inclus dans l'export vers JW Library.
- **MCAD** (ajouté 2026-07-20) — fiche d'étude hebdomadaire pour le livre « Marche courageusement avec Dieu » (`WCG_CHAPTERS`, 54 chapitres en 3 parties, méthode en 8 étapes `WCG_STEPS`). Avance d'un chapitre par semaine (`autoPrepareWCG()`, throttle 6h comme le module Réunion), génération via `runWCGStudy()` — calqué sur `runStudy()` (mêmes briques : Pollinations, résolution TMN via `window.resolveBibleReference`, retry). Les fiches sont de simples entrées `G.history` (`categorie:'mcad'`), donc affichées dans Études et synchronisées via le Gist existant sans code de sync dédié. Table des matières extraite directement du PDF local de l'utilisateur (via PyMuPDF, pas de wol.jw.org) — fiable.

**Stockage :** `localStorage`, préfixe de clé `jw_dbx_v1` (historique des études, notes JW, token/Gist GitHub, pointeur de chapitre MCAD, historique du module Réunion sous des clés `wk:*`).

Note historique : une version antérieure de ce fichier documentait des modules « Perle Spirituelle », « Questions des lecteurs », « École du ministère » et une clé `jw_v6` — ils ne correspondent plus au code actuel du dépôt et ont été retirés de cette documentation en 2026-07 pour éviter toute confusion. S'ils doivent être réintroduits, ce sera un projet à part entière.

## Position sur le sang — mise à jour du 18 septembre 2026

Le **Point actualité n° 6 du Collège central (2026)** a modifié la position sur les composants du sang. L'onglet Sang a été aligné dessus le 2026-09-20. Références officielles utilisées (toutes publiées en français) :

| Document | Référence exacte | docId wol |
|---|---|---|
| Point actualité n° 6 du Collège central (vidéo, 14 min 34 s) | jw.org, 18 sept. 2026 | — |
| « Comment les Témoins de Jéhovah montrent-ils du respect pour la vie ? » (Questions des lecteurs) | **pas encore paru en *Tour de Garde*** — l'article annonce qu'il « paraîtra dans un prochain numéro » | — |
| Tableau « Composants et produits dérivés du sang total » (PDF) | `mrt-F 149 9/26` | pub-media docid `501100138` |
| Point actualité n° 2 du Collège central — sang autologue | jw.org, 2026 | — |
| « Le point de vue de Dieu sur le sang » | `lff leçon 39` | `1102021239` |
| « Préparons-nous dès à présent à une urgence médicale » | `mwb23 janvier p. 7` | `202023010` |
| « Connaissez-vous les choix qui s'offrent à vous ? » | `km 1/11 p. 2` | `202011004` |
| Questions des lecteurs — emploi lié au sang | `w99 15/4 p. 28-30` | `1999286` |
| Questions des lecteurs — fractions (avant 2026) | `w00 15/10 p. 30-31` | `2000767` |
| Questions des lecteurs — fractions (avant 2026) | `w04 15/6 p. 29-31` | `2004448` |
| « Les fractions sanguines et les techniques opératoires » (avant 2026) | `lv p. 215-218 § 1` | `1102008086` |
| « Les Témoins de Jéhovah acceptent-ils les traitements médicaux ? » | `w11 1/2 p. 27` | `2011090` |
| Brochure « Les Témoins de Jéhovah et la question du sang » (1977) | `bq p. 3-64` | `1101977010` |

Les références ont été relevées le 2026-09-20 dans le fil de navigation de chaque document wol
(`<div id="publicationNavigation">`), pas déduites. **Ne jamais deviner un docId wol** : `1999283`
avait été supposé pour la Question des lecteurs de 1999 et pointait en réalité sur « Vous montrez-vous
reconnaissant ? ». Pour retrouver un article, passer par le sommaire du numéro :
`wol.jw.org/fr/wol/library/r30/lp-f/toutes-les-publications/la-tour-de-garde/la-tour-de-garde-<année>/<15-avril>`.

**Ce qui ne change pas** : pas de transfusion de sang total, pas de don de sang destiné à une transfusion de sang total, pas de consommation de sang ni de viande non saignée, et le respect de la vie (guerre, avortement, imprudence).

**Ce qui devient une décision personnelle** : les quatre composants principaux tirés du sang d'autrui (globules rouges, globules blancs, plasma, plaquettes), au même titre que les fractions ; ainsi que le don de composants ou de fractions de son propre sang destiné à autrui.

Versets cités par le point actualité et repris dans `BLOOD_PRINCIPLES` : Galates 6:5, Romains 14:12, 1 Corinthiens 4:6, 2 Corinthiens 1:24, 1 Timothée 1:5, Psaume 36:9.

⚠️ Des **articles d'étude de la Tour de Garde** et une **mise à jour des instructions médicales (DPA)** sont annoncés : à intégrer quand ils paraîtront.

## Module Réunion (onglet « Réunion » de `index.html`)

- Récupération dynamique du programme de réunion depuis wol.jw.org, via plusieurs proxies CORS publics essayés en séquence (r.jina.ai, api.allorigins.win, corsproxy.io, api.codetabs.com — le proxy personnalisé saisi par l'utilisateur est essayé en premier).
- **Repli par copier-coller** : si tous les proxies échouent, un champ permet de coller directement le texte du programme copié depuis wol.jw.org (ouvert via un lien dédié) — la génération se fait alors sans aucun appel proxy.
- Auto-calcul de la semaine ISO en cours ; préparation automatique au lancement de l'app si la semaine courante n'est pas encore prête (limité à une tentative auto toutes les 6h).
- Génération de contenu via **Pollinations uniquement** (gratuit, sans clé — voir ci-dessous).

## Génération IA (Étude Biblique + Réunion)

**Pollinations uniquement, gratuit et sans clé.** Groq a été retiré volontairement (2026-07) pour éliminer toute gestion de clé API côté utilisateur, au prix d'une fiabilité un peu moindre (parfois lent ou indisponible — l'utilisateur peut alors réessayer, ou utiliser « Copier le prompt pour Claude » dans le module Réunion pour un traitement manuel vérifié).

## Synchronisation entre appareils

**GitHub Gist privé** (remplace Dropbox depuis 2026-07, jugé trop lourd à configurer). L'utilisateur génère un Personal Access Token classique avec la seule case `gist` cochée (`github.com/settings/tokens/new`) et le colle dans l'onglet Sync. L'app trouve ou crée automatiquement un Gist privé nommé `etude-biblique-jw-sync.json` pour y stocker l'historique des études.

## Workflow de déploiement

1. Modifications faites localement (`c:\Dev\etude-jw`), commit + push vers `main` via git.
2. GitHub Pages se redéploie automatiquement (parfois avec un délai — un déclenchement manuel via `gh api -X POST repos/chmicmoreau-source/etude-jw/pages/builds` peut être nécessaire s'il ne se lance pas seul).
3. Le service worker sert `index.html` en réseau-prioritaire (pas de cache périmé après déploiement), mais un premier rechargement peut encore montrer l'ancienne version le temps que le nouveau service worker s'active — recharger une deuxième fois si besoin.
4. Tester sur l'appareil réel (Android).

## Points de vigilance connus

- **Proxy CORS public** : fragilité connue pour la récupération wol.jw.org — mitigée par le multi-proxy et le repli par copier-coller (voir « Module Réunion »), mais reste un point à surveiller si de nouvelles pannes apparaissent.
- **Pollinations** : seul moteur de génération IA du projet — fiabilité correcte mais pas garantie ; en cas d'échec répété, l'utilisateur peut réessayer ou utiliser le prompt copiable.
- **Secrets** : ne jamais coder en dur une clé API ou un token dans le code — toujours un champ localStorage rempli par l'utilisateur (cf. incident de clé Anthropic exposée dans l'historique git, commit `e377f04`, révoquée).
- **Canva** (hors PWA) : réécrit systématiquement les textes fournis plutôt que de les préserver verbatim ; l'édition programmatique de designs générés par IA échoue avec « No approval received » — ne pas s'appuyer sur l'automatisation Canva pour du texte figé.

## Priorité de développement

L'axe principal du projet reste **l'étude biblique approfondie** (fiches, résumés, questions de révision alimentés par wol.jw.org). La PWA et la préparation de discours sont des outils au service de cet objectif, pas une fin en soi.
