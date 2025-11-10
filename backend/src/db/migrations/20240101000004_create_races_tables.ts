import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Races table
  await knex.schema.createTable('races', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('meeting_location', 255).notNullable();
    table.date('meeting_date').notNullable();
    table.integer('race_number').notNullable();
    table.string('race_name', 255).notNullable();
    table.integer('distance').notNullable();
    table.string('track_condition', 50);
    table.timestamp('start_time', { useTz: true }).notNullable();
    table.enum('status', ['upcoming', 'live', 'resulted', 'abandoned']).defaultTo('upcoming');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.unique(['meeting_location', 'meeting_date', 'race_number']);
    table.index('start_time');
    table.index('status');
    table.index(['meeting_location', 'meeting_date']);
  });

  // Horses table
  await knex.schema.createTable('horses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.integer('age');
    table.string('sex', 10);
    table.string('trainer', 255);
    table.string('jockey', 255);
    table.string('form', 50);
    table.decimal('weight', 5, 2);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.index('name');
    table.index('trainer');
    table.index('jockey');
  });

  // Race entries (horses in races)
  await knex.schema.createTable('race_entries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('race_id').notNullable().references('id').inTable('races').onDelete('CASCADE');
    table.uuid('horse_id').notNullable().references('id').inTable('horses').onDelete('CASCADE');
    table.integer('barrier_number');
    table.integer('horse_number').notNullable();
    table.boolean('scratched').defaultTo(false);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    
    table.unique(['race_id', 'horse_number']);
    table.index('race_id');
    table.index('horse_id');
  });

  // Apply triggers
  await knex.raw(`
    CREATE TRIGGER update_races_updated_at
    BEFORE UPDATE ON races
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  await knex.raw(`
    CREATE TRIGGER update_horses_updated_at
    BEFORE UPDATE ON horses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('race_entries');
  await knex.schema.dropTableIfExists('horses');
  await knex.schema.dropTableIfExists('races');
}
