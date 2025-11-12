import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // User favorites table - stores onboarding selections and ongoing favorites
  await knex.schema.createTable('user_favorites', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('favorite_type', ['jockey', 'trainer', 'track', 'bookmaker']).notNullable();
    table.string('favorite_name', 255).notNullable();
    table.jsonb('metadata').nullable(); // For storing additional data like stats
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.unique(['user_id', 'favorite_type', 'favorite_name']);
    table.index('user_id');
    table.index(['user_id', 'favorite_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_favorites');
}
