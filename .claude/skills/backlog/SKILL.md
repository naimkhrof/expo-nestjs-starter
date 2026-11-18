---
name: backlog
description: Cadrer une nouvelle app, importer un cahier des charges, créer ou découper epics et US, modifier une US, consigner une décision ou un changement client, exporter l'état du produit. Utiliser pour « importe mon cahier des charges », « crée les issues », « découpe cette feature », « modifie l'US 12 », « le client veut changer… » ou au démarrage d'un projet.
argument-hint: [fichier, planche ou idée]
---

# Gérer le produit et le backlog

Trois sources, chacune à un seul endroit (voir `CLAUDE.md`) : `PRODUCT.md` (le produit aujourd'hui), les GitHub Issues (epics, US, bugs, décisions), Claude Design (l'interface).

## Cadrer une app (avant tout code)

1. Lire les sources (cahier des charges, devis, pré-maquette, notes client) et noter leur version.
2. **Dépendances externes**, dans `PRODUCT.md` › Contraintes : droits sur les contenus, comptes stores, paiement, hébergement et RGPD, services tiers, et toute personne qui doit valider quelque chose (qui, quoi, délai, ce que la V1 fait sans elle). Ce qui bloque devient une issue en tête du backlog.
3. Rédiger `PRODUCT.md` (une page), faire valider.
4. **V1 figée** : la liste des epics de la V1 ; le reste prend le label `après-v1`. Aucun epic ne s'insère avant la sortie sans issue `decision`.
5. Epics d'abord, puis US en sous-issues (voir plus bas). Une US = un comportement testable par un seul profil ; une règle absente des sources va dans « Questions client », jamais inventée.
6. Présenter la liste complète (titres, labels, ordre, packs) et **attendre l'accord** avant de créer quoi que ce soit.
7. Créer : labels `gh label create <nom> --force` (`epic`, `story`, `bug`, `decision`, `changement`, `question-client`, `après-v1`, `backend`, `mobile`, `backoffice`), vérifier les doublons (`gh issue list --state all --search …`), puis `gh issue create --body-file …`.
8. **Revue à froid** avant le premier epic de code : un sous-agent relit `PRODUCT.md`, le modèle de données prévu et les epics, et cherche contradictions, dépendances oubliées, tables sans lecteur. Corriger avant de coder.

Les sources importées restent hors du dépôt (dossier client) : jamais de `docs/` ni d'`archive/`.

## Cahier des charges et versions

Le PDF envoyé au client est une **photo** du produit à une date, jamais une source qu'on maintient.

- Chaque US porte « Source : CDC vX §… » (champ du modèle) : on sait quelle version la fonde.
- Envoyer une version : `pnpm product:export > <dossier client>/cdc-vX.md` (PRODUCT.md + epics + US et critères, lus sur GitHub), mettre en page, puis `git tag cdc-vX && git push origin cdc-vX`. Revoir une ancienne version : ce fichier, ou `git show cdc-vX:PRODUCT.md`.
- Circuit d'une US client (champ Status du GitHub Project) : Brouillon → À valider client → Gelé → Prêt dev → En cours → Terminé. Un retour client met à jour l'US + commentaire « Retour client du JJ/MM : … ».
- Après le gel, toute demande du client est une issue `changement` : US touchées, impact délai et prix, accord du client. Puis on modifie les US ; la version suivante du CDC le montre.

## Epics et packs

- Epic = issue `epic` + `epic:<nom>` : objectif, dépendance, packs de session, contrats, sous-issues.
- Sous-issues natives : `gh api -X POST repos/{owner}/{repo}/issues/<epic>/sub_issues -F sub_issue_id=<id>` où `<id>` = `gh api repos/{owner}/{repo}/issues/<n> --jq .id` ; ordre par `…/sub_issues/priority` (`sub_issue_id`, `after_id`).
- Un pack = les US d'une même session (mêmes fichiers ou même validation). Après tout déplacement, régénérer la liste du corps de l'epic depuis l'API.

## Modifier une US

| État | Action |
| --- | --- |
| Ouverte, pas commencée | Modifier le corps + commentaire `Décision : … — raison : …` |
| En cours | Skill `story` : l'issue avant le code |
| Fermée | Jamais réécrite : nouvelle issue « Modifier #<n> : … » |

## Décisions

Une décision qui change le produit = une issue `decision` (modèle), puis `PRODUCT.md` réécrit **à l'état nouveau** à l'endroit concerné : pas de journal ni d'amendement daté.
