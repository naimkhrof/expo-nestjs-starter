---
name: turborepo
description: "Turborepo and pnpm workspace configuration in this monorepo: turbo.json, task dependencies, caching, environment variables, filters and CI. Use for shared tooling and pipeline changes; not for mobile UI or NestJS business logic."
---

# Turborepo

## Project integration

Scope: shared monorepo tooling. Resolve turbo from the repository root and read its bundled docs. Keep apps/mobile and apps/api as separate pnpm packages with one root lockfile. The backend and Metro run on the host; compose.yaml hosts PostgreSQL and optional Maildev. Do not introduce Nx, another package manager or remote cache setup as part of an unrelated request.

Source: [vercel/turborepo](https://github.com/vercel/turborepo/tree/20a88e67579e46eddb9f91bd3845521735e4f24e/skills/turborepo). Project-specific adaptations are tracked in `.agents/skills.lock.json`.


The complete Turborepo documentation ships inside the installed `turbo` package. Do not rely on this skill for framework guidance. Always read the bundled docs, which match the installed version exactly.

Start with:

```text
node_modules/turbo/docs/README.md
```

Use that task index to choose the smallest relevant documentation page. Read it before changing Turborepo configuration, package scripts, or CI workflows.

If the package manager uses a non-flat `node_modules` layout or a workspace link, resolve the package location first:

```sh
node -p "require.resolve('turbo/package.json')"
```

Then read `docs/README.md` relative to the resolved package directory.

If `turbo` is not installed, inspect the repository's package manager and existing version constraints before adding it. After installation, use the bundled docs rather than guidance for a different release.
