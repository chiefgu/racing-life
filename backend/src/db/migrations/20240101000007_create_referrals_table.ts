import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Referrals table (affiliate tracking)
  await knex.schema.createTable('referrals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('ambassador_id').references('id').inTable('ambassadors').onDelete('SET NULL');
    table.uuid('bookmaker_id').notNullable().references('id').inTable('bookmakers').onDelete('CASCADE');
    table.uuid('race_id').references('id').inTable('races').onDelete('SET NULL');
    table.uuid('article_id').references('id').inTable('articles').onDelete('SET NULL');
    table.timestamp('clicked_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('converted_at', { useTz: true });
    table.decimal('commission', 10, 2);
    table.specificType('ip_address', 'INET');
    table.text('user_agent');
    table.string('referral_code', 100);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('ambassador_id');
    table.index('bookmaker_id');
    table.index('clicked_at');
  });

  // Create index for converted referrals
  await knex.raw(`
    CREATE INDEX idx_referrals_converted 
    ON referrals(converted_at DESC) 
    WHERE converted_at IS NOT NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('referrals');
}
