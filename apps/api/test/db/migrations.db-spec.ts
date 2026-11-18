import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { DataSource } from 'typeorm';
import { createTempDatabase } from './temp-database';

/** Tables de l'application (hors `migrations`, tenue par TypeORM). */
const tables = async (db: DataSource): Promise<string[]> =>
  (
    await db.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name <> 'migrations'
       ORDER BY table_name`,
    )
  ).map((row: { table_name: string }) => row.table_name);

describe('Migrations', () => {
  let db: DataSource;
  let drop: () => Promise<void>;

  beforeAll(async () => {
    const temp = await createTempDatabase();
    db = temp.dataSource;
    drop = temp.drop;
  });

  afterAll(async () => {
    await drop();
  });

  it('should apply migrations on an empty database and leave nothing pending', async () => {
    expect(await tables(db)).toEqual([]);
    await db.runMigrations();
    expect((await tables(db)).length).toBeGreaterThan(0);
    expect(await db.showMigrations()).toBe(false);
  });

  it('should revert every migration, one by one, down to an empty database', async () => {
    const applied: { name: string }[] = await db.query(
      'SELECT name FROM migrations',
    );
    expect(applied.length).toBeGreaterThan(0);
    for (let i = 0; i < applied.length; i++) {
      await db.undoLastMigration();
    }
    expect(await tables(db)).toEqual([]);
  });

  it('should apply migrations again after reverting them', async () => {
    await db.runMigrations();
    expect(await db.showMigrations()).toBe(false);
  });
});
