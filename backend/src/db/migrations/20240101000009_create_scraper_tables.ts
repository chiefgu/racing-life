import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Scraper sources table
  await knex.schema.createTable('scraper_sources', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).unique().notNullable();
    table.text('url').notNullable();
    table.enum('source_type', ['rss', 'web', 'api']);
    table.string('market', 10).defaultTo('AU');
    table.integer('poll_interval').defaultTo(30);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_scraped_at', { useTz: true });
    table.timestamp('last_success_at', { useTz: true });
    table.integer('failure_count').defaultTo(0);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('is_active');
    table.index('source_type');
  });

  // Scraper metrics table (will be converted to hypertable)
  await knex.schema.createTable('scraper_metrics', (table) => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('source_id').notNullable().references('id').inTable('scraper_sources').onDelete('CASCADE');
    table.boolean('success').notNullable();
    table.integer('duration_ms');
    table.integer('records_collected').defaultTo(0);
    table.text('error_message');
    table.timestamp('timestamp', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    
    table.primary(['id', 'timestamp']);
  });

  // Note: TimescaleDB hypertable conversion skipped for development
  console.log('Scraper metrics table created (using regular table for development)');

  // Create index (works on regular tables too)
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_scraper_metrics_source_time
    ON scraper_metrics(source_id, timestamp DESC)
  `);

  // Apply trigger
  await knex.raw(`
    CREATE TRIGGER update_scraper_sources_updated_at
    BEFORE UPDATE ON scraper_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Simply drop tables (no TimescaleDB-specific cleanup needed for development)
  await knex.schema.dropTableIfExists('scraper_metrics');
  await knex.schema.dropTableIfExists('scraper_sources');
}
