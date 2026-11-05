---
name: generate
description: "Generate a persisted NestJS resource or add a domain property in apps/api using the Brocoders Hygen generators. Use for new entities, relations and persisted fields; choose PostgreSQL relational generators from DATABASE_TYPE, not from the mere presence of MongoDB scripts."
---

# Generate Entities and Properties

## Project integration

Scope: apps/api. This is the restored Brocoders generator skill. Run its pnpm commands from the monorepo root. For persistence variant, read DATABASE_TYPE from the local backend configuration (or .env.example if no local override is available). postgres selects relational. Do not select all-db merely because its script exists. Preserve the original generator relationship and DTO rules below.

The only maintained copy of this skill is `.claude/skills/generate/` at the repository root. Do not create app-local skill copies or aliases. Hygen templates (`.hygen/`) and configuration (`.hygen.js`) stay in `apps/api`; the pnpm workspace filter below runs Hygen there when invoked from the repository root.

Source: [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate/tree/9620f159eefe38f47747d02ab162852367c5472c/.claude/skills/generate). Provenance and license: THIRD_PARTY.md.


## Detect the database variant

This workspace uses PostgreSQL (`DATABASE_TYPE=postgres`), so `{db}` is `relational`.
Check the effective backend configuration if that choice changes deliberately. MongoDB/document and all-db scripts still exist upstream; their presence does not make them the active database.

## Add an entity/schema

**Rules:**
- **Never generate `User` or `File` entities** — they already exist. You can reference them in relationships.
- Entity names must be PascalCase and singular (e.g., `Post`, `Category`, `BlogComment`).

**Command:**

```bash
pnpm --filter @starter/api generate:resource:{db} --name {EntityName}
```

`{db}` comes from the detection section above.

Run sequentially, one entity at a time.

## Add a property to an entity/schema

**Rules:**
- **Never add `id`, `createdAt`, or `updatedAt`** — these are predefined for all entities.
- Property names must be camelCase (e.g., `firstName`, `isActive`).

**Property kinds:**
- `primitive` — basic types: `string`, `number`, `boolean`, `Date`
- `reference` — relationship to another entity
- `denormalized` — denormalized copy of another entity's data (stored inline instead of referenced)

**Relationship rules:**
- When creating a property with `referenceType: "oneToMany"`, **do NOT** create the corresponding `manyToOne` in the referenced entity — the generator creates it automatically.
- **Do NOT create `oneToMany`** if the `propertyInReference` could have many items. Instead, create a `manyToOne` on the child entity only.
- For **File** relations, use only `oneToOne` or `manyToMany`.
- `propertyInReference` is only required when `referenceType` is `oneToMany`.

**Command:**

```bash
pnpm --filter @starter/api add:property:to-{db} --name {EntityName} --property {propertyName} --kind {kind} --type {type} --referenceType {referenceType} --propertyInReference {propertyInReference} --isAddToDto {isAddToDto} --isOptional {isOptional} --isNullable {isNullable} --shouldAutoLoad {shouldAutoLoad}
```

**Argument rules:**
- `--name` (required): Entity name, PascalCase
- `--property` (required): Property name, camelCase
- `--kind` (required): `primitive` | `reference` | `denormalized`
- `--type` (required): For primitive: `string` | `number` | `boolean` | `Date`. For reference/denormalized: the referenced entity name (e.g., `User`, `File`, `Category`)
- `--referenceType`: Only for reference/denormalized kind. Values: `oneToOne` | `oneToMany` | `manyToOne` | `manyToMany`
- `--propertyInReference`: Only when `referenceType` is `oneToMany`. The property name on the referenced entity.
- `--isAddToDto`: `true` | `false` — whether the property can be set via HTTP request
- `--isOptional`: `true` | `false`
- `--isNullable`: `true` | `false` — only meaningful when `isOptional` is `true`
- `--shouldAutoLoad`: `true` (default) | `false`. Only meaningful for `kind=reference`. `true` emits `eager: true` (TypeORM) and `autopopulate: true` (Mongoose). `false` stores only the related entity's id (Mongoose: `string` field + ObjectId; TypeORM: `eager: false`). No effect for `primitive`/`denormalized`.

**Omit arguments that don't apply** (e.g., omit `--referenceType` for primitive properties, omit `--propertyInReference` unless `referenceType` is `oneToMany`).

Run sequentially, one property at a time.

## PostgreSQL migrations and validation

After inspecting the generated files, create a migration when the schema changes:

```sh
pnpm --filter @starter/api migration:generate src/database/migrations/DescribeChange
pnpm --filter @starter/api typecheck
pnpm --filter @starter/api lint
```

Read the generated SQL before applying it to the intended local database. Use `pnpm db:migrate` for the local workspace. Do not use `DATABASE_SYNCHRONIZE=true` or `schema:drop` to replace migration work. Do not create a persisted resource for an endpoint that does not need one.
