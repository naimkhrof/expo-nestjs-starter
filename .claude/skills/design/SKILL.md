---
name: design
description: Tenir le document Claude Design de l'app (pages, planches, nommage, versions, suppression) et relier une planche à une issue. Utiliser pour créer ou modifier une planche, ranger ou supprimer des maquettes, « fais la maquette de… », « range Claude Design », ou quand `story` et `backlog` touchent un écran.
argument-hint: [écran, issue ou « ménage »]
---

# Tenir les maquettes

Un document Claude Design par app (artifact de type Design), dont le lien est dans `PRODUCT.md` › Design. C'est la seule référence de l'interface. Les règles fixes sont dans `CLAUDE.md` › Design ; ce skill dit comment les appliquer.

## Rangement

- La planche `Design system` (tokens, copie de `packages/ui/src/tokens.css`, et composants) vient en tête. Puis un écran par planche, groupé par flux ou par thème sous une note de section.
- Une page par surface seulement quand le document en dessine plusieurs (`App`, `Web`…). Sans pages, tout le document est actif.
- `Explorations` (directions visuelles, variantes, écrans d'après la V1) se crée au premier besoin ; le code ne s'y réfère jamais. Pas de page d'archive : l'historique des versions du document garde tout.
- Aucun autre artifact de maquette : la démo client et les directions visuelles vivent dans ce document.
- Un écran n'existe qu'une fois : pas de copie ni de « v2 », pas de « Duplicate ».

## Nommage

- Fichier : `<Écran>[-<État>]`, ASCII, PascalCase, unique dans le document (`MesFavoris`, `MesFavoris-Vide`).
- Titre visible : « Écran · état », dans la langue de l'app.
- Aucun numéro d'issue sur une planche : l'issue pointe vers la planche, jamais l'inverse.

## Planches et états

- Une planche = un écran. Ses états (vide, erreur, chargement), quand l'US les demande, y sont dessinés côte à côte ou ont leur planche `<Écran>-<État>`. Un état vide dit pourquoi et propose l'action suivante.
- Textes : ceux de l'issue, rien d'inventé ; ce qui manque est marqué « à fournir » sur la planche.

## Lien avec l'issue

La section « Maquette » de l'issue porte, par planche, le lien profond `https://claude.ai/artifact/<id>#artboard-<fichier sans .dc.html>` et son état : `à créer`, `à modifier` ou `validée`. Le statut vit là seulement.

## Autour d'une US

1. **Avant le code** (skill `story`) : lire `project/canvas.json`, puis la planche. L'éditer en place (nouvelle planche seulement pour un écran nouveau) et publier avec le label `#<n>` : la version précédente garde l'état d'origine. Lien dans l'issue ; l'accord de Naïm sur le plan vaut `validée`.
2. **Pendant** : un écart décidé en codant est reporté sur la planche avant la fusion, ou écrit comme décision dans l'issue.
3. **Après** : captures (plateformes : `CLAUDE.md` › Design), dans chaque langue, en regard de la planche dans le même état. Écarts corrigés dans le code, ou reportés sur la planche et dans l'issue.

Un token qui change se modifie dans `tokens.css` et sur la planche `Design system` dans la même US.

## Supprimer

- Écran retiré ou remplacé : sa planche est supprimée, après avoir vérifié que le code ne la cite plus (`grep -rn <nom> apps packages`) et repointé ou retiré les liens (`href`, `<dc-import>`) des planches actives vers elle. Le code fait foi : une planche qu'il cite est vivante, quel que soit son nom. Une ancienne version se relit dans l'historique du document.
- Exploration tranchée : la direction retenue passe en page active, le reste est supprimé.
- Ménage à la fin de chaque epic : chaque planche active correspond à un écran du code ou d'une issue ouverte, sinon elle est supprimée.

## Sources

- Figma, [Team file organization](https://www.figma.com/best-practices/team-file-organization/) : un seul axe de rangement, exploration séparée du validé, un écran n'existe qu'une fois, noms lisibles seuls, versions nommées aux jalons, l'historique des versions plutôt que des copies.
- Figma, [Dev Mode statuses](https://help.figma.com/hc/en-us/articles/26781702258583-Dev-Mode-statuses-and-notifications) : pas de statut de page, d'où une convention maison (ici, dans l'issue).
- [Linear et Figma](https://linear.app/docs/figma), [Figma for Jira](https://www.atlassian.com/blog/add-ons/developer-designer-collaborate-with-figma-jira-integration) : le ticket porte le lien profond vers la frame.
- NN/g, [Empty states](https://www.nngroup.com/articles/empty-state-interface-design/) : un état vide dit l'état du système et mène à l'action suivante.
- Figma, [Design tokens](https://www.figma.com/resource-library/design-tokens/) : une seule source des tokens, ici le code.
- Anthropic, [Claude Design pour prototypes et UX](https://academy.claude.com/tutorials/using-claude-design-for-prototypes-and-ux) : canevas, une planche par écran, commentaires, reprise dans Claude Code ; le mode d'emploi du type Design (lu dans le document) donne pages, notes et liens `#artboard-`, `#page-`, `#play-`.
