import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // News articles table
  await knex.schema.createTable('news_articles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('source_id', 100).notNullable();
    table.string('source_name', 255).notNullable();
    table.string('title', 500).notNullable();
    table.text('content').notNullable();
    table.string('author', 255);
    table.timestamp('published_at', { useTz: true }).notNullable();
    table.text('url').unique().notNullable();
    table.string('content_hash', 64).unique().notNullable();
    table.enum('sentiment_overall', ['positive', 'negative', 'neutral']);
    table.decimal('sentiment_confidence', 3, 2);
    table.text('rewritten_content');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('published_at');
    table.index('source_id');
    table.index('sentiment_overall');
    table.index('content_hash');
  });

  // News article entities table
  await knex.schema.createTable('news_article_entities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('article_id').notNullable().references('id').inTable('news_articles').onDelete('CASCADE');
    table.enum('entity_type', ['horse', 'jockey', 'trainer', 'meeting']).notNullable();
    table.string('entity_name', 255).notNullable();
    table.enum('sentiment', ['positive', 'negative', 'neutral']);
    table.decimal('sentiment_confidence', 3, 2);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('article_id');
    table.index(['entity_type', 'entity_name']);
  });

  // Apply trigger
  await knex.raw(`
    CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('news_article_entities');
  await knex.schema.dropTableIfExists('news_articles');
}
