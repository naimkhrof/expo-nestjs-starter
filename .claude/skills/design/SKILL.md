---
name: design
description: Tenir le document Claude Design de l'app (pages, planches, nommage, versions, archive) et relier une planche à une issue. Utiliser pour créer ou modifier une planche, ranger ou archiver des maquettes, « fais la maquette de… », « range Claude Design », ou quand `story` et `backlog` touchent un écran.
argument-hint: [écran, issue ou « ménage »]
---

# Tenir les maquettes

Un document Claude Design par app (artifact de type Design), dont le lien est dans `PRODUCT.md` › Design. C'est la seule référence de l'interface. Les règles fixes sont dans `CLAUDE.md` › Design ; ce skill dit comment les appliquer.

## Pages

| Page | Contenu | Le code s'y réfère ? |
| --- | --- | --- |
| `Design system` | les tokens (copie de `packages/ui/src/tokens.css`) et les composants | oui |
| une page par surface dessinée : `App`, `Web`… | un écran par planche, rangé par flux (une note de section par flux) | **oui** |
| `Explorations` | directions visuelles, variantes, écrans d'après la V1, idées | non |
| `Archive · <surface>` | écrans retirés ou remplacés | non |

- Aucune autre page et aucun autre artifact de maquette. Les directions visuelles et la démo client vivent dans ce document ; un doublon trouvé ailleurs y est rapatrié ou abandonné.
- Un écran n'existe qu'une fois : pas de copie entre pages ni de « v2 ». Le bouton « Duplicate » de Claude Design n'est pas utilisé.

## Nommage

- Fichier de planche : `<PRÉFIXE>-<Écran>[-<État>]`, ASCII et PascalCase, un préfixe par surface (`APP-`, `WEB-`, `DS-`), par exemple `APP-Favoris`, `APP-Favoris-Vide`. Le préfixe ne change pas quand la planche part en archive.
- Titre visible : « Écran · état », dans la langue de l'app.
- Aucun numéro d'issue sur une planche : l'issue pointe vers la planche, jamais l'inverse.

## Planches, états, flux

- Une planche = un écran dans un état. Les états vide, chargement et erreur ont leur planche (`-Vide`, `-Erreur`…) quand l'US les demande ; un état vide dit pourquoi c'est vide et propose l'action suivante.
- Un flux est une suite de planches sous une note de section, dans l'ordre du parcours, lisible avec le lien `#play-<chemin>`.
- Textes de la planche : ceux de l'issue, rien d'inventé ; ce qui manque est marqué sur la planche (« texte à fournir »).

## Lien avec l'issue

La section « Maquette » de l'issue porte, pour chaque planche :
- le lien profond `https://claude.ai/artifact/<id>#artboard-<chemin>` (`<chemin>` sans `.dc.html`, autres caractères remplacés par `-`) ;
- l'état : `à créer`, `à modifier` ou `validée`. Aucune pour une US sans écran.

Le statut vit là, et seulement là. Sur le canevas, la page suffit : active, exploration ou archive.

## Autour d'une US

1. **Avant le code** (skill `story`, étape 1) : lire `project/canvas.json`, puis la planche.
   - Planche à modifier : publier d'abord une version nommée `#<n> avant` (paramètre `label` de la publication). C'est elle qui garde l'état d'origine, pas une copie.
   - Éditer en place sur la page active (nouvelle planche seulement pour un écran nouveau), publier avec le label `#<n>`, mettre le lien dans l'issue.
   - L'accord de Naïm sur le plan vaut validation : l'issue passe à `validée`.
2. **Pendant** : la planche est la spec de l'écran. Un écart décidé en codant est reporté sur la planche avant la fusion, ou écrit comme décision dans l'issue.
3. **Après** : captures du simulateur (voir `CLAUDE.md` › Design pour les plateformes), dans chaque langue, en regard de la planche dans le même état. Écarts corrigés dans le code, ou reportés sur la planche et dans l'issue. À la fusion, la planche décrit ce qui est livré.

Un token qui change se modifie dans `packages/ui/src/tokens.css` et sur la page `Design system` dans la même US.

## Archiver

- Écran retiré du produit ou remplacé par une refonte : sa planche est déplacée (champ `page` dans `canvas.json`) vers `Archive · <surface>`, jamais copiée.
- Exploration tranchée : la direction retenue passe sur la page active, le reste en archive.
- Planche d'après la V1 : dans `Explorations` jusqu'au lancement de son epic.
- Ménage à la fin de chaque epic : chaque planche d'une page active correspond à un écran du code ou d'une issue ouverte ; sinon, archive.

## Sources

- Figma, [Team file organization](https://www.figma.com/best-practices/team-file-organization/) : un axe par surface, pages par étape du cycle de vie, un écran n'existe qu'une fois, noms lisibles seuls, versions nommées aux jalons, archive par surface.
- Figma, [Dev Mode statuses](https://help.figma.com/hc/en-us/articles/26781702258583-Dev-Mode-statuses-and-notifications) : statut « Ready for dev » et « Changed » ; pas de statut de page, d'où une convention maison.
- [Linear et Figma](https://linear.app/docs/figma), [Figma for Jira](https://www.atlassian.com/blog/add-ons/developer-designer-collaborate-with-figma-jira-integration) : le ticket porte le lien profond vers la frame.
- NN/g, [Empty states](https://www.nngroup.com/articles/empty-state-interface-design/) : un état vide dit l'état du système et mène à l'action suivante.
- Figma, [Design tokens](https://www.figma.com/resource-library/design-tokens/) : une seule source des tokens, ici le code.
- Anthropic, [Claude Design pour prototypes et UX](https://academy.claude.com/tutorials/using-claude-design-for-prototypes-and-ux) : canevas, une planche par écran, commentaires, export, reprise dans Claude Code ; le mode d'emploi du type Design (lu dans le document) donne pages, notes et liens `#artboard-`, `#page-`, `#play-`.
