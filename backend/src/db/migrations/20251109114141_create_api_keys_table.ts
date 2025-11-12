import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('api_keys', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('key_hash', 64).notNullable().unique();
    table.string('name', 100).notNullable();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.specificType('permissions', 'text[]').defaultTo('{}');
    table.integer('rate_limit').defaultTo(60).notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamp('last_used_at');
    table.timestamp('expires_at');
    table.timestamps(true, true);

    table.index('key_hash');
    table.index('user_id');
    table.index('is_active');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('api_keys');
}

