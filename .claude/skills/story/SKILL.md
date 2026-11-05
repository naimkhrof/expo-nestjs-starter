---
name: story
description: Développer une US ou corriger un bug à partir d'une issue GitHub, de l'interview jusqu'à la pull request. Utiliser quand l'utilisateur dit « on attaque #12 », « /story 12 », « développe l'issue 12 » ou reprend une issue en cours.
argument-hint: <numéro d'issue>
---

# Travailler une issue

L'issue est la seule spec. Elle est mise à jour **avant** le code, jamais après.

## 1. Comprendre

- `gh issue view <n> --comments` ; lire `PRODUCT.md` et le code concerné.
- Issue fermée : ne pas la modifier ni la rouvrir. Proposer une nouvelle issue « Modifier #<n> : … » (skill `backlog`) et travailler sur celle-ci.
- Ouvrir les maquettes jointes à l'issue (liens, images) avant toute question d'interface.

## 2. Interviewer

Poser des questions (outil de questions à choix) jusqu'à pouvoir écrire la spec, uniquement sur ce qui change la réalisation : règles métier, données et leur durée de vie, cas limites, erreurs, hors périmètre. Remettre en cause l'US si elle contredit `PRODUCT.md`, le code existant ou une autre issue, et proposer l'alternative. Ne pas poser de question dont la réponse est dans l'issue, le code ou la maquette.

Bug simple et reproductible : passer directement à l'étape 4.

## 3. Mettre l'issue à jour

Réécrire le corps de l'issue (`gh issue edit <n> --body-file <fichier>`) en gardant ses sections : Besoin, Critères d'acceptation (cases à cocher vérifiables), Maquette, Notes (règles, données, hors périmètre). Si une décision modifie le besoin initial, ajouter un commentaire : `Décision : … — raison : …`. Montrer le diff du corps à l'utilisateur avant de l'enregistrer.

## 4. Planifier, backend d'abord

Proposer un plan court, dans cet ordre :

1. **Données** : entités et relations (skill `generate` pour toute nouvelle persistance), migration.
2. **API** : endpoints, DTO, règles, avec un test par critère d'acceptation testable côté serveur.
3. **Mobile** : appels réseau (`expo-data-fetching`), écrans d'après la maquette.

Montrer seulement ce qui engage : modèle de données, endpoints, nouvelles dépendances (avec la raison et l'alternative déjà présente dans le starter). Attendre la validation de l'utilisateur. Si la modification tient en une phrase, ne pas faire de plan.

## 5. Réaliser

- Branche `story/<n>-<slug>` (ou `fix/<n>-<slug>` pour un bug).
- Implémenter dans l'ordre du plan. Si le besoin change en route : arrêter, mettre l'issue à jour (étape 3), puis reprendre.
- Cocher dans l'issue les critères réellement vérifiés.

## 6. Vérifier

- `pnpm typecheck`, `pnpm lint`, `pnpm test` ; `pnpm build` si la configuration ou les dépendances changent.
- Faire relire le diff par un sous-agent contre l'issue : chaque critère est-il couvert, quels cas limites manquent. Corriger les écarts.
- Interface : vérifier sur simulateur (skill `expo-dev-client`) ou dans le navigateur intégré pour le web.

## 7. Livrer

Proposer le commit, le push et la PR (modèle `.github/pull_request_template.md`, avec `Closes #<n>`). Pousser et ouvrir la PR seulement après accord. Signaler ce qui n'a pas été vérifié.
