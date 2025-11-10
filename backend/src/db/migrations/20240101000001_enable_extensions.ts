import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Note: TimescaleDB is optional and only needed for production optimization
  // Development works fine without it
  console.log('Extensions enabled (TimescaleDB skipped for development)');
}

export async function down(knex: Knex): Promise<void> {
  // Note: Extensions are typically not dropped in down migrations
  // as they may be used by other databases or applications
  await knex.raw('DROP EXTENSION IF EXISTS timescaledb CASCADE');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE');
}
