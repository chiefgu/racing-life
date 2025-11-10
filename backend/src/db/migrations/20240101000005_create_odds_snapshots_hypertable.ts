import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Odds snapshots table (will be converted to hypertable)
  await knex.schema.createTable('odds_snapshots', (table) => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('race_id').notNullable().references('id').inTable('races').onDelete('CASCADE');
    table.uuid('horse_id').notNullable().references('id').inTable('horses').onDelete('CASCADE');
    table.uuid('bookmaker_id').notNullable().references('id').inTable('bookmakers').onDelete('CASCADE');
    table.string('market', 20).defaultTo('AU');
    table.decimal('win_odds', 10, 2).notNullable();
    table.decimal('place_odds', 10, 2);
    table.timestamp('timestamp', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.enum('source_type', ['api', 'scraper']).defaultTo('api');
    
    table.primary(['id', 'timestamp']);
  });

  // Add check constraint for odds values
  await knex.raw(`
    ALTER TABLE odds_snapshots
    ADD CONSTRAINT check_win_odds CHECK (win_odds >= 1.01)
  `);

  await knex.raw(`
    ALTER TABLE odds_snapshots
    ADD CONSTRAINT check_place_odds CHECK (place_odds IS NULL OR place_odds >= 1.01)
  `);

  // Note: TimescaleDB hypertable conversion skipped for development
  // The table will work fine as a regular PostgreSQL table
  console.log('Odds snapshots table created (using regular table for development)');

  // Create indexes (these work on regular tables too)
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_odds_race_time
    ON odds_snapshots(race_id, timestamp DESC)
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_odds_horse_time
    ON odds_snapshots(horse_id, timestamp DESC)
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_odds_bookmaker_time
    ON odds_snapshots(bookmaker_id, timestamp DESC)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Simply drop the table (no TimescaleDB-specific cleanup needed for development)
  await knex.schema.dropTableIfExists('odds_snapshots');
}
