import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Featured content table for homepage hero section
  await knex.schema.createTable('featured_content', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.enum('type', ['featured_story', 'expert_analysis']).notNullable();
    table.string('title', 500).notNullable();
    table.text('description').notNullable();
    table.string('image_url', 500);
    table.string('author_name', 255);
    table.string('author_image_url', 500);
    table.timestamp('published_at', { useTz: true });
    table.string('link_url', 500); // Optional link to full article
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['type', 'is_active', 'display_order']);
    table.index('published_at');
  });

  // Apply trigger
  await knex.raw(`
    CREATE TRIGGER update_featured_content_updated_at
    BEFORE UPDATE ON featured_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('featured_content');
}
