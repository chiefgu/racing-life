import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Bookmakers table
  await knex.schema.createTable('bookmakers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).unique().notNullable();
    table.string('slug', 255).unique().notNullable();
    table.text('logo_url');
    table.text('affiliate_link').notNullable();
    table.decimal('rating', 3, 2).defaultTo(0.00);
    table.boolean('api_enabled').defaultTo(false);
    table.text('api_endpoint');
    table.enum('auth_type', ['api_key', 'oauth', 'basic']);
    table.enum('status', ['active', 'inactive', 'maintenance']).defaultTo('active');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('slug');
    table.index('status');
  });

  // Bookmaker features table
  await knex.schema.createTable('bookmaker_features', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('bookmaker_id').notNullable().references('id').inTable('bookmakers').onDelete('CASCADE');
    table.string('feature_name', 100).notNullable();
    table.text('feature_value');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('bookmaker_id');
  });

  // Promotions table
  await knex.schema.createTable('promotions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('bookmaker_id').notNullable().references('id').inTable('bookmakers').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description');
    table.text('terms');
    table.timestamp('start_date', { useTz: true });
    table.timestamp('end_date', { useTz: true });
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('bookmaker_id');
    table.index(['is_active', 'end_date']);
  });

  // Apply triggers
  await knex.raw(`
    CREATE TRIGGER update_bookmakers_updated_at
    BEFORE UPDATE ON bookmakers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  await knex.raw(`
    CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('promotions');
  await knex.schema.dropTableIfExists('bookmaker_features');
  await knex.schema.dropTableIfExists('bookmakers');
}
