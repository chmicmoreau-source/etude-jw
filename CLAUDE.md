# CLAUDE.md — Contexte du projet `etude-jw`

Ce fichier donne à Claude Code le contexte nécessaire pour travailler sur ce dépôt sans avoir à tout réexpliquer à chaque session.

## Vue d'ensemble du projet

PWA (Progressive Web App) d'étude biblique personnelle, hébergée sur **GitHub Pages** (`chmicmoreau-source/etude-jw`, branche `main`).

Deux fichiers principaux, autonomes l'un de l'autre :

- **`index.html`** — l'application principale (tableau de bord + modules).
- **`etude-reunion-semaine.html`** — préparation autonome de la réunion « Vie et ministère chrétiens », avec récupération dynamique du programme depuis wol.jw.org.

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

## Architecture de `index.html` (modules)

- **Perle Spirituelle** — méthode L.E.I.A (Lire, Expliquer, Illustrer, Appliquer) + les six questions analytiques : Où, Qui, Quand, Quoi, Pourquoi, Comment.
- **Questions des lecteurs** — base de 50+ questions historiques de la Tour de Garde, maintenue en dur (rubrique discontinuée dans la publication actuelle, donc pas de récupération dynamique possible).
- **Onglet Sang** — questionnaire médical.
- **École du ministère** — module dédié.
- **Tableau de bord d'accueil** — modulaire, point d'entrée vers les autres modules.

**Stockage :** `localStorage`, clé `jw_v6`. Base JW Library chargée en mémoire dans `G.jwDb`.

## Architecture de `etude-reunion-semaine.html`

- Récupération dynamique du programme de réunion depuis wol.jw.org (via proxy CORS public — **instable, à surveiller**).
- Auto-calcul de la semaine ISO en cours.
- Génération de contenu via LLM :
  1. Groq API (`llama-3.3-70b-versatile` → fallback `llama-3.1-8b-instant` → fallback `gemma2-9b-it`)
  2. Pollinations en fallback gratuit si Groq indisponible (sans clé API — fiabilité à confirmer)

## Workflow de déploiement

1. Édition directe via l'interface web GitHub (pas de push/pull local systématique).
2. `Ctrl+A` → coller le nouveau contenu → `Commit`.
3. Attendre ~2 minutes (propagation GitHub Pages).
4. Tester sur l'appareil réel (Android).

## Points de vigilance connus

- **Proxy CORS public** : point de fragilité identifié pour la récupération wol.jw.org — prévoir un fallback ou une alternative si des pannes récurrentes sont constatées.
- **Pollinations** : fiabilité non garantie en l'absence de clé API — à traiter comme un fallback de dernier recours, pas une solution principale.
- **Canva** (hors PWA) : réécrit systématiquement les textes fournis plutôt que de les préserver verbatim ; l'édition programmatique de designs générés par IA échoue avec « No approval received » — ne pas s'appuyer sur l'automatisation Canva pour du texte figé.

Ajout CLAUDE.md - contexte projet
## Priorité de développement

L'axe principal du projet reste **l'étude biblique approfondie** (fiches, résumés, questions de révision alimentés par wol.jw.org). La PWA et la préparation de discours sont des outils au service de cet objectif, pas une fin en soi.
