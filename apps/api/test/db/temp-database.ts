import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';

const connection = (database: string | undefined): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database,
});

/**
 * Base jetable sur le serveur PostgreSQL de développement : créée vide, migrée par
 * les migrations de l'app, détruite à la fin. La base de travail n'est jamais
 * touchée ; on ne s'y connecte que pour créer et supprimer la base jetable.
 */
export async function createTempDatabase() {
  const name = `${process.env.DATABASE_NAME ?? 'app'}_test_${randomBytes(6).toString('hex')}`;
  const admin = await new DataSource(
    connection(process.env.DATABASE_NAME),
  ).initialize();
  await admin.query(`CREATE DATABASE "${name}"`);

  const src = path.join(__dirname, '..', '..', 'src');
  const dataSource = await new DataSource({
    ...connection(name),
    entities: [path.join(src, '**', '*.entity.ts')],
    migrations: [path.join(src, 'database', 'migrations', '*.ts')],
  }).initialize();

  return {
    dataSource,
    async drop() {
      await dataSource.destroy();
      await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
      await admin.destroy();
    },
  };
}
