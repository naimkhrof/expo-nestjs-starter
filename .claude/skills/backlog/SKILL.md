---
name: backlog
description: Cadrer une nouvelle app à partir de l'analyse des besoins, rédiger PRODUCT.md, créer ou découper epics et US, générer le cahier des charges client, modifier une US, consigner une décision ou un changement client. Utiliser pour « on démarre un nouveau client », « crée les issues », « génère le cahier des charges », « découpe cette feature », « modifie l'US 12 », « le client veut changer… ».
argument-hint: [notes, fichier ou idée]
---

# Gérer le produit et le backlog

Trois sources, chacune à un seul endroit (voir `CLAUDE.md`) : `PRODUCT.md` (le produit aujourd'hui), les GitHub Issues (epics, US, bugs, décisions), le document Claude Design (l'interface). Le cahier des charges client n'est pas une source : il est **généré** à partir des deux premières.

## Cadrer une app (avant tout code)

1. **Lire l'analyse des besoins** : notes d'entretien, documents du client, cahier des charges existant s'il y en a un. Ils ne servent qu'à ce cadrage et restent hors du dépôt.
2. **Dépendances externes**, dans `PRODUCT.md` › Contraintes : droits sur les contenus, comptes stores, paiement, hébergement et RGPD, services tiers, et toute personne qui doit valider quelque chose (qui, quoi, délai, ce que la V1 fait sans elle). Ce qui bloque devient une issue en tête du backlog.
3. **`PRODUCT.md`** (une page) : pour qui, proposition, V1 (les epics, une ligne chacun), hors périmètre, contraintes.
4. **Epics puis US** : présenter la liste complète (titres, labels, ordre, packs) avec les critères d'acceptation, et **attendre l'accord** avant de créer quoi que ce soit. Une US = un comportement testable par un seul profil ; une règle absente des sources va dans « Questions client », jamais inventée.
5. **Créer** : labels `gh label create <nom> --force` (`epic`, `us`, `bug`, `decision`, `changement`, `question-client`, `impacte-maquette`, `après-v1`, plus un label par profil), vérifier les doublons (`gh issue list --state all --search …`), puis `gh issue create --body-file …`. Chaque question client devient une issue `question-client`.
6. **Direction visuelle et démo** (document Claude Design, skill `design`) : deux directions sur la page `Explorations`, le client en choisit une, l'autre part en archive ; page `Design system` ; trois à cinq planches clés pour la démo sur la page de leur surface. Ces planches sont les définitives : on les éditera en place, epic par epic.
7. **Cahier des charges généré** : un document client (artifact Docs, export PDF ou Word) produit depuis `PRODUCT.md` et les issues : contexte, profils, V1 par epic avec ses US et leurs critères en langage client, hors périmètre, dépendances et ce que le client fournit, jalons, lien de la démo. Rien n'y est ajouté qui ne soit d'abord dans `PRODUCT.md` ou une issue : une correction du client se fait dans la source, puis on régénère. Le document signé et le devis restent hors du dépôt.
8. **V1 figée** à la signature : le reste prend le label `après-v1`. Aucun epic ne s'insère avant la sortie sans issue `decision`.
9. **Revue à froid** avant le premier epic de code : un sous-agent relit `PRODUCT.md`, le modèle de données prévu et les epics, et cherche contradictions, dépendances oubliées, tables sans lecteur. Corriger avant de coder.

Le client arrive avec son propre cahier des charges : il compte comme une source de l'étape 1. On ne le tient pas à jour, et aucune US ne le cite.

## Après la signature

- Statuts d'une US (champ Status du GitHub Project) : Todo → En cours → Terminé. Une US en Todo est relue avant d'être développée. Un retour client met à jour l'US + commentaire « Retour client du JJ/MM : … ».
- Toute demande nouvelle du client est une issue `changement` : US touchées, impact délai et prix, accord du client. Puis on modifie les US.

## Epics et packs

- Epic = issue `epic` : objectif, dépendance, packs de session, contrats, sous-issues.
- Sous-issues natives : `gh api -X POST repos/{owner}/{repo}/issues/<epic>/sub_issues -F sub_issue_id=<id>` où `<id>` = `gh api repos/{owner}/{repo}/issues/<n> --jq .id` ; ordre par `…/sub_issues/priority` (`sub_issue_id`, `after_id`).
- Un pack = les US d'une même session (mêmes fichiers ou même validation). Après tout déplacement, régénérer la liste du corps de l'epic depuis l'API.

## Modifier une US

| État | Action |
| --- | --- |
| Ouverte, pas commencée | Modifier le corps + commentaire `Décision : … — raison : …` |
| En cours | Skill `story` : l'issue avant le code |
| Fermée | Jamais réécrite : nouvelle issue « Modifier #<n> : … » |

## Décisions

Une décision qui change le produit = une issue `decision`, puis `PRODUCT.md` réécrit **à l'état nouveau** à l'endroit concerné : pas de journal ni d'amendement daté.
