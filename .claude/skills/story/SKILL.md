---
name: story
description: Développer une US, un pack d'US d'un epic ou corriger un bug à partir d'une issue GitHub, de l'interview jusqu'à la fusion sur main. Utiliser pour « on attaque #12 », « /story 12 », « /story epic 3 pack 2 » ou la reprise d'une issue en cours.
argument-hint: <issue> | epic <issue> [pack <k>]
---

# Développer une issue

L'issue est la seule spec : elle est mise à jour **avant** le code. Les règles du projet sont dans `CLAUDE.md` ; ce skill n'en répète aucune.

## Epic (`/story epic <n> [pack <k>]`)

1. L'epic dont il dépend doit être fermé et fusionné ; sinon s'arrêter.
2. Lire l'epic, ses décisions citées, puis ses sous-issues dans l'ordre : `gh api repos/{owner}/{repo}/issues/<n>/sub_issues`.
3. Figer les contrats de l'epic (schémas, endpoints) dans son corps ; un seul accord pour tout l'epic.
4. Ne traiter que le pack demandé (sinon le premier non terminé), chaque US par les étapes 1 à 6, une branche par US fusionnée avant la suivante.
5. Fin de pack : push de `main`, commentaire de reprise sur l'epic (US fermées, écarts, points ouverts), puis s'arrêter. Le pack suivant se lance dans une nouvelle session.

## 1. Comprendre

- `gh issue view <n> --comments`, `PRODUCT.md`, le code concerné.
- Issue fermée : ne pas la rouvrir ; créer « Modifier #<n> : … » (skill `backlog`) et travailler dessus.
- Écran : ouvrir la planche Claude Design citée dans l'issue (skill `design` : version `#<n> avant`, édition en place, lien et état dans l'issue). Pas de planche validée → s'arrêter : la planche se fait d'abord. Un bug ou une US sans écran n'en a pas besoin.

## 2. Interviewer

Questions à choix, seulement sur ce qui change la réalisation : règles métier, données, cas limites, erreurs, hors périmètre. Signaler toute contradiction avec `PRODUCT.md`, le code, la planche ou une autre issue, avec une alternative. Une règle métier absente des sources n'est pas inventée : c'est une question au client (label `question-client`). Bug reproductible : aller à l'étape 4.

## 3. Mettre l'issue à jour

Réécrire le corps (`gh issue edit <n> --body-file …`) dans les sections du modèle ; montrer le diff avant d'enregistrer. Un changement du besoin initial : commentaire `Décision : … — raison : …`.

## 4. Planifier, backend d'abord

Données (skill `generate` pour une ressource CRUD), puis API avec un test par critère testable côté serveur, puis écrans d'après la planche. Ne montrer que ce qui engage : modèle, endpoints, dépendances nouvelles et leur raison. Attendre l'accord. Une modification d'une phrase n'a pas de plan.

## 5. Réaliser

Branche `story/<n>-<slug>` ou `fix/<n>-<slug>`. Si le besoin change en route : arrêter, étape 3, reprendre. Cocher dans l'issue les critères vérifiés.

## 6. Vérifier puis livrer

1. `pnpm typecheck`, `pnpm lint`, `pnpm test` (+ `pnpm test:db` si migration, `pnpm build` si config ou dépendances).
2. Relecture du diff contre l'issue par un sous-agent (`scout` haiku ou `worker` sonnet, modèle explicite) ; corriger.
3. Écran : simulateur iOS **et** émulateur Android, dans chaque langue ; captures en regard de la planche dans le même état, écarts corrigés dans le code ou reportés sur la planche et dans l'issue (skill `design`). Back-office : navigateur intégré.
4. Sans PR ni confirmation : commit (Conventional Commits, français), `git switch main && git pull --ff-only && git merge --no-ff <branche>` avec `Closes #<n>`, branche supprimée. Push de `main` en fin de session seulement (après la dernière US ou le dernier bug ; plus tôt si un déploiement est attendu : correctif urgent, essai sur build), puis issues fermées et cochées (`CLAUDE.md`, « CI et minutes »).

Conflit ou vérification en échec : s'arrêter et le dire. Toujours signaler ce qui n'a pas été vérifié.
