import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ambassadors table
  await knex.schema.createTable('ambassadors', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').unique().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('slug', 255).unique().notNullable();
    table.text('bio');
    table.text('profile_image_url');
    table.decimal('commission_rate', 5, 2).defaultTo(0.00);
    table.enum('status', ['pending', 'active', 'suspended']).defaultTo('pending');
    table.timestamp('joined_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('slug');
    table.index('status');
    table.index('user_id');
  });

  // Ambassador social links table
  await knex.schema.createTable('ambassador_social_links', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('ambassador_id').notNullable().references('id').inTable('ambassadors').onDelete('CASCADE');
    table.string('platform', 50).notNullable();
    table.text('url').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('ambassador_id');
  });

  // Articles table
  await knex.schema.createTable('articles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('ambassador_id').notNullable().references('id').inTable('ambassadors').onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.string('slug', 500).unique().notNullable();
    table.text('content').notNullable();
    table.text('excerpt');
    table.text('featured_image_url');
    table.enum('status', ['draft', 'pending', 'published', 'archived']).defaultTo('draft');
    table.timestamp('published_at', { useTz: true });
    table.integer('views').defaultTo(0);
    table.integer('clicks').defaultTo(0);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('ambassador_id');
    table.index('slug');
    table.index('status');
  });

  // Create index for published articles
  await knex.raw(`
    CREATE INDEX idx_articles_published 
    ON articles(published_at DESC) 
    WHERE status = 'published'
  `);

  // Article tags table
  await knex.schema.createTable('article_tags', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('article_id').notNullable().references('id').inTable('articles').onDelete('CASCADE');
    table.string('tag', 100).notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.unique(['article_id', 'tag']);
    table.index('article_id');
    table.index('tag');
  });

  // Article related races table
  await knex.schema.createTable('article_related_races', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('article_id').notNullable().references('id').inTable('articles').onDelete('CASCADE');
    table.uuid('race_id').notNullable().references('id').inTable('races').onDelete('CASCADE');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.unique(['article_id', 'race_id']);
    table.index('article_id');
    table.index('race_id');
  });

  // Apply triggers
  await knex.raw(`
    CREATE TRIGGER update_ambassadors_updated_at
    BEFORE UPDATE ON ambassadors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  await knex.raw(`
    CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('article_related_races');
  await knex.schema.dropTableIfExists('article_tags');
  await knex.schema.dropTableIfExists('articles');
  await knex.schema.dropTableIfExists('ambassador_social_links');
  await knex.schema.dropTableIfExists('ambassadors');
}
