import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

/**
 * Projet Railway : l'API et sa base, décrites en code.
 * Aperçu : `railway config plan` ; application : `railway config apply`.
 * Les secrets restent chez Railway (`preserve()`), jamais dans ce fichier.
 * Sur un projet Railway existant : `railway config pull` d'abord (voir README.md).
 *
 * Deux environnements Railway, une seule branche `main` :
 * - `production` : tout le projet, données réelles ;
 * - `staging` : l'API et sa base seulement, données jetables, pour la recette (build EAS
 *   `preview`). Pas de sauvegarde. Viser un environnement : `--environment staging`.
 */

/** Nom du projet : `slug` de starter.config.json (racine du dépôt), lancé depuis la racine ou `.railway/`. */
const configPath = ["starter.config.json", "../starter.config.json"].find((p) => existsSync(p));
if (!configPath) throw new Error("starter.config.json introuvable : lancer railway depuis la racine du dépôt ou .railway/");
const { slug } = JSON.parse(readFileSync(configPath, "utf8")) as { slug: string };

/** Dépôt GitHub déduit du remote `origin` (git@github.com:o/r.git ou https://github.com/o/r.git). */
const remote = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
const repo = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
if (!repo) throw new Error(`Le remote origin n'est pas un dépôt GitHub : ${remote}`);

/** Amsterdam (UE) : base et API dans la même région, donc en réseau privé. */
const REGION = "europe-west4-drams3a";

export default defineRailway((ctx) => {
  const prod = ctx.isEnvironment("production");
  // Image Railway `postgres-ssl` : l'API passe par le réseau privé, sans SSL côté client.
  const Postgres = postgres("Postgres", { region: REGION });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const postgresVolume = volume("postgres-volume", {
    region: REGION,
    sizeMB: prod ? 5000 : 1000,
    allowOnlineResize: true,
    alerts: { usage: { "80": {}, "95": {}, "100": {} } },
  });

  const api = service("api", {
    // Déploie `main` après une CI verte.
    source: github(repo, { branch: "main", checkSuites: true }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/api/Dockerfile",
      // Ne reconstruit l'API que si elle ou ce qu'elle embarque change.
      watchPatterns: ["apps/api/**", "packages/**", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"],
    },
    deploy: {
      // Les migrations passent avant la bascule : si l'une échoue, l'ancienne version reste en ligne.
      preDeployCommand: [
        "node /repo/apps/api/node_modules/typeorm/cli.js --dataSource=/repo/apps/api/dist/database/data-source.js migration:run",
      ],
      healthcheckPath: "/",
      healthcheckTimeout: 120,
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 5,
      // Pas de mise en veille : le premier appel après la veille peut rendre 502.
      sleepApplication: false,
      // Plafond de dépense : NestJS tient dans ~250 Mo.
      limitOverride: { containers: { cpu: 1, memoryBytes: 1024 * 1024 * 1024 } },
      drainingSeconds: 15,
    },
    replicas: { [REGION]: 1 },
    // Production : domaine à ajouter dans le tableau de bord Railway (le code ne peut pas
    // l'enregistrer), puis `railway config pull` ; renseigner BACKEND_DOMAIN, FRONTEND_DOMAIN
    // et APP_CORS_ORIGINS. Staging : domaine *.up.railway.app généré (`railway domain`),
    // que ce fichier ne décrit pas.
    env: {
      NODE_ENV: "production",
      PORT: "8080",
      APP_NAME: prod ? slug : `${slug} (staging)`,
      API_PREFIX: "api",
      APP_FALLBACK_LANGUAGE: "en",
      APP_HEADER_LANGUAGE: "x-custom-lang",
      // Staging : pas de back-office en ligne ; celui lancé en local peut viser cette API.
      FRONTEND_DOMAIN: prod ? "" : "http://localhost:8081",
      BACKEND_DOMAIN: prod ? "" : "https://${{RAILWAY_PUBLIC_DOMAIN}}",
      APP_CORS_ORIGINS: prod ? "" : "http://localhost:8081",
      APP_TRUST_PROXY: "1",
      DATABASE_TYPE: "postgres",
      DATABASE_URL: Postgres.env.DATABASE_URL,
      DATABASE_SYNCHRONIZE: "false",
      DATABASE_MAX_CONNECTIONS: "20",
      DATABASE_SSL_ENABLED: "false",
      DATABASE_REJECT_UNAUTHORIZED: "false",
      FILE_DRIVER: "local",
      // Aucun mail n'est envoyé tant qu'un fournisseur n'est pas branché : valeurs factices.
      MAIL_HOST: "localhost",
      MAIL_PORT: "1025",
      MAIL_IGNORE_TLS: "true",
      MAIL_SECURE: "false",
      MAIL_REQUIRE_TLS: "false",
      MAIL_DEFAULT_EMAIL: "noreply@example.com",
      MAIL_DEFAULT_NAME: slug,
      MAIL_CLIENT_PORT: "1080",
      // Secrets propres à chaque environnement, posés chez Railway.
      AUTH_JWT_SECRET: preserve(),
      AUTH_JWT_TOKEN_EXPIRES_IN: "15m",
      AUTH_REFRESH_SECRET: preserve(),
      AUTH_REFRESH_TOKEN_EXPIRES_IN: "30d",
      AUTH_FORGOT_SECRET: preserve(),
      AUTH_FORGOT_TOKEN_EXPIRES_IN: "30m",
      AUTH_CONFIRM_EMAIL_SECRET: preserve(),
      AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN: "1d",
      AUTH_UNIFORM_ERRORS: "true",
      APPLE_APP_AUDIENCE: "[]",
    },
  });

  // Sauvegarde quotidienne : pg_dump vers un bucket S3 compatible (R2, Scaleway…), chaque
  // jour à 3 h UTC, sous `backups/postgres/`. Une règle d'expiration du bucket efface les
  // anciennes. Endpoint, bucket et clés sont posés chez Railway (`preserve()`).
  const backup = service("backup", {
    source: github(repo, { branch: "main", checkSuites: true }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: ".railway/backup/Dockerfile",
      watchPatterns: [".railway/backup/**"],
    },
    deploy: {
      cronSchedule: "0 3 * * *",
      restartPolicyType: "NEVER",
      limitOverride: { containers: { cpu: 1, memoryBytes: 512 * 1024 * 1024 } },
    },
    replicas: { [REGION]: 1 },
    env: {
      DATABASE_URL: Postgres.env.DATABASE_URL,
      BACKUP_S3_ENDPOINT: preserve(),
      BACKUP_S3_BUCKET: preserve(),
      BACKUP_S3_ACCESS_KEY_ID: preserve(),
      BACKUP_S3_SECRET_ACCESS_KEY: preserve(),
    },
  });

  return project(slug, {
    variables: { managed: true },
    resources: prod ? [Postgres, postgresVolume, api, backup] : [Postgres, postgresVolume, api],
  });
});
