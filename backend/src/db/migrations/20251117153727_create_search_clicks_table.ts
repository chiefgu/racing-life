import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('search_clicks', (table) => {
    table.increments('id').primary();
    table.string('result_id').notNullable();
    table.string('result_type').notNullable(); // 'news', 'horse', 'jockey', 'trainer'
    table.string('query').notNullable();
    table.timestamp('clicked_at').notNullable();

    // Indexes for faster queries
    table.index(['result_id', 'result_type']);
    table.index('query');
    table.index('clicked_at');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('search_clicks');
}

