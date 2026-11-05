---
name: backlog
description: Créer, découper ou modifier le backlog GitHub Issues à partir d'un cahier des charges, d'une maquette ou d'une idée, et rédiger PRODUCT.md. Utiliser pour « importe mon cahier des charges », « crée les issues », « découpe cette feature », « modifie l'US 12 » ou au démarrage d'une nouvelle app.
argument-hint: [fichier, lien de maquette ou idée]
---

# Gérer le backlog

Les GitHub Issues sont la seule source des US et des bugs. Aucun backlog, PRD ou spec n'est maintenu dans le dépôt à côté.

## Démarrer une app ou importer un cahier des charges

1. Lire la source (document, PDF, captures, lien Figma) et le code existant.
2. Rédiger ou compléter `PRODUCT.md` (une page) et le faire valider.
3. Découper en issues :
   - une issue = une US livrable et testable de bout en bout, pas une tâche technique ;
   - nouvelle app : la première issue est « Fondations : modèle de données, authentification, dépendances » ;
   - garder les identifiants historiques dans le titre (`US-012 — …`) ;
   - corps au format du modèle `.github/ISSUE_TEMPLATE/story.yml` : Besoin, Critères d'acceptation (cases à cocher), Maquette, Notes ;
   - US floue : la créer quand même avec une note « À clarifier : … ». L'interview se fera au démarrage (skill `story`).
4. Présenter la liste complète (titres, labels, ordre) et **attendre l'accord** avant de créer quoi que ce soit sur GitHub.
5. Labels : `gh label create <nom> --force` pour `story`, `bug`, `backend`, `mobile` et un `epic:<nom>` par epic.
6. Vérifier les doublons (`gh issue list --state all --search "<titre>"`), puis créer avec `gh issue create --title … --body-file … --label …`.
7. Une fois importée, la source est **gelée** : la déplacer dans `archive/` (ou la laisser hors du dépôt) avec une ligne indiquant qu'elle n'est plus maintenue.

## Modifier une US

| État de l'issue | Action |
| --- | --- |
| Ouverte, pas commencée | Modifier le corps + commentaire `Décision : … — raison : …` |
| En cours | Passer par le skill `story` : l'issue est mise à jour avant le code |
| Fermée (livrée) | Ne jamais la réécrire ni la rouvrir : nouvelle issue « Modifier US-012 : … » qui renvoie à `#<n>` |

Une décision qui change le produit lui-même s'ajoute aussi en une ligne dans `PRODUCT.md` (« Décisions structurantes »).

## Tableau kanban (facultatif)

Un GitHub Project en vue Board (`À faire` → `En cours` → `Terminé`), avec le workflow intégré « Auto-add » sur le dépôt, suffit. Le piloter en ligne de commande demande le scope `project` : `gh auth refresh -s project`. Ne pas dupliquer le kanban ailleurs.
