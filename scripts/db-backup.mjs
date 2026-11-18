#!/usr/bin/env node
// Sauvegarde locale de la base PostgreSQL de développement. Tout passe par le
// service `postgres` de compose.yaml (le projet compose est nommé par
// `starter:init`) : aucun outil PostgreSQL n'est requis sur la machine.
import { spawn, spawnSync } from "node:child_process";
import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { randomBytes } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { slug } = JSON.parse(
  readFileSync(path.join(ROOT, "starter.config.json"), "utf8"),
);
const BACKUP_DIR =
  process.env.DB_BACKUP_DIR ?? path.join(os.homedir(), `${slug}-backups`);

const USAGE = `Usage :
  pnpm db:backup                     écrit un pg_dump compressé dans ${BACKUP_DIR} (DB_BACKUP_DIR pour un autre dossier)
  pnpm db:backup:verify <fichier>    restaure dans une base jetable et compare le nombre de lignes de chaque table
  pnpm db:restore <fichier> --force  restaure dans la base de travail, en remplaçant son contenu`;

/** Commande shell dans le conteneur : identifiants lus dans son environnement. */
const inPostgres = (script) => [
  "compose",
  "exec",
  "-T",
  "postgres",
  "sh",
  "-c",
  script,
];

const run = (script, { input, output } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn("docker", inPostgres(script), {
      cwd: ROOT,
      stdio: [input ? "pipe" : "ignore", "pipe", "inherit"],
    });
    const chunks = [];
    if (output) child.stdout.pipe(output);
    else child.stdout.on("data", (chunk) => chunks.push(chunk));
    if (input) {
      // La commande peut sortir avant d'avoir tout lu : son code de sortie le dit.
      child.stdin.on("error", () => undefined);
      input.on("error", reject);
      input.pipe(child.stdin);
    }
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve(Buffer.concat(chunks).toString("utf8"))
        : reject(new Error(`« ${script} » a échoué (code ${code})`)),
    );
  });

/** Nombre de lignes de chaque table du schéma public. */
const COUNTS = `SELECT table_name, (xpath('/row/c/text()', query_to_xml(format('SELECT count(*) AS c FROM %I.%I', table_schema, table_name), false, true, '')))[1]::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY 1`;
const counts = (database) =>
  run(`psql -U "$POSTGRES_USER" -d ${database} -At -c "${COUNTS}"`);

const megabytes = (file) =>
  `${(statSync(file).size / 1024 / 1024).toFixed(1)} Mo`;

const backup = async () => {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  const file = path.join(BACKUP_DIR, `${slug}-${stamp}.dump`);
  const output = createWriteStream(file);
  try {
    await run('pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"', { output });
    await new Promise((resolve) => output.end(resolve));
  } catch (error) {
    // Pas de fichier partiel sous le nom d'une sauvegarde.
    output.destroy();
    rmSync(file, { force: true });
    throw error;
  }
  console.log(`Sauvegarde écrite : ${file} (${megabytes(file)})`);
};

const verify = async (file) => {
  const name = `backup_check_${randomBytes(6).toString("hex")}`;
  await run(`createdb -U "$POSTGRES_USER" ${name}`);
  try {
    await run(`pg_restore -U "$POSTGRES_USER" -d ${name} --no-owner`, {
      input: createReadStream(file),
    });
    const [restored, current] = [
      await counts(name),
      await counts('"$POSTGRES_DB"'),
    ];
    console.log(restored.trim());
    if (restored !== current) {
      throw new Error(
        `La sauvegarde ne correspond pas à la base de travail :\n${current.trim()}`,
      );
    }
    console.log(
      `Sauvegarde vérifiée : ${restored.trim().split("\n").length} table(s), mêmes comptes que la base de travail.`,
    );
  } finally {
    await run(`dropdb -U "$POSTGRES_USER" --force ${name}`).catch((error) =>
      console.error(`Base jetable ${name} non supprimée : ${error.message}`),
    );
  }
};

const restore = async (file) => {
  await run(
    'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner',
    { input: createReadStream(file) },
  );
  console.log(`Base de travail restaurée depuis ${file}`);
};

const [command, file, flag] = process.argv.slice(2);
const docker = spawnSync("docker", ["compose", "ps", "-q", "postgres"], {
  cwd: ROOT,
  encoding: "utf8",
});
if (docker.status !== 0 || docker.stdout.trim() === "") {
  console.error("La base ne tourne pas : lancer `pnpm db:up` d’abord.");
  process.exit(1);
}
try {
  if (command === "backup") await backup();
  else if (command === "verify" && file) await verify(path.resolve(file));
  else if (command === "restore" && file && flag === "--force") {
    await restore(path.resolve(file));
  } else {
    console.error(USAGE);
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
