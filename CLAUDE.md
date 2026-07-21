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
- **MCAD** (ajouté 2026-07-20) — fiche d'étude hebdomadaire pour le livre « Marche courageusement avec Dieu » (`WCG_CHAPTERS`, 54 chapitres en 3 parties, méthode en 8 étapes `WCG_STEPS`). Avance d'un chapitre par semaine (`autoPrepareWCG()`, throttle 6h comme le module Réunion), génération via `runWCGStudy()` — calqué sur `runStudy()` (mêmes briques : Pollinations, résolution TMN via `window.resolveBibleReference`, retry). Les fiches sont de simples entrées `G.history` (`categorie:'mcad'`), donc affichées dans Études et synchronisées via le Gist existant sans code de sync dédié. Table des matières extraite directement du PDF local de l'utilisateur (via PyMuPDF, pas de wol.jw.org) — fiable.

**Stockage :** `localStorage`, préfixe de clé `jw_dbx_v1` (historique des études, notes JW, token/Gist GitHub, pointeur de chapitre MCAD, historique du module Réunion sous des clés `wk:*`).

Note historique : une version antérieure de ce fichier documentait des modules « Perle Spirituelle », « Questions des lecteurs », « Onglet Sang », « École du ministère » et une clé `jw_v6` — ils ne correspondent plus au code actuel du dépôt et ont été retirés de cette documentation en 2026-07 pour éviter toute confusion. S'ils doivent être réintroduits, ce sera un projet à part entière.

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
