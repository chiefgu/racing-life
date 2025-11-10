import knex from '../db/knex';
import bcrypt from 'bcrypt';

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const [_adminUser] = await knex('users')
      .insert({
        email: 'admin@racinglife.com',
        password_hash: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      })
      .returning('*')
      .onConflict('email')
      .ignore();

    const [ambassadorUser] = await knex('users')
      .insert({
        email: 'ambassador@racinglife.com',
        password_hash: hashedPassword,
        name: 'John Ambassador',
        role: 'ambassador',
      })
      .returning('*')
      .onConflict('email')
      .ignore();

    // Create sample bookmakers
    const bookmakers = await knex('bookmakers')
      .insert([
        {
          name: 'Sportsbet',
          slug: 'sportsbet',
          website_url: 'https://www.sportsbet.com.au',
          affiliate_link: 'https://www.sportsbet.com.au',
          is_active: true,
          welcome_offer: 'Bet $50 Get $150 in Bonus Bets',
          rating: 4.5,
        },
        {
          name: 'Ladbrokes',
          slug: 'ladbrokes',
          website_url: 'https://www.ladbrokes.com.au',
          affiliate_link: 'https://www.ladbrokes.com.au',
          is_active: true,
          welcome_offer: 'Up to $500 in Bonus Bets',
          rating: 4.3,
        },
        {
          name: 'Neds',
          slug: 'neds',
          website_url: 'https://www.neds.com.au',
          affiliate_link: 'https://www.neds.com.au',
          is_active: true,
          welcome_offer: '$250 Welcome Bonus',
          rating: 4.4,
        },
      ])
      .returning('*')
      .onConflict('slug')
      .ignore();

    // Create sample races
    const races = await knex('races')
      .insert([
        {
          name: 'Melbourne Cup',
          race_number: 7,
          scheduled_start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          status: 'scheduled',
          distance: 3200,
          prize_money: 8000000,
          race_type: 'Group 1',
          track_condition: 'Good 4',
          weather_condition: 'Fine',
        },
        {
          name: 'Cox Plate',
          race_number: 8,
          scheduled_start: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
          status: 'scheduled',
          distance: 2040,
          prize_money: 5000000,
          race_type: 'Group 1',
          track_condition: 'Soft 5',
          weather_condition: 'Overcast',
        },
        {
          name: 'Golden Slipper',
          race_number: 5,
          scheduled_start: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          status: 'scheduled',
          distance: 1200,
          prize_money: 3500000,
          race_type: 'Group 1',
          track_condition: 'Good 3',
          weather_condition: 'Sunny',
        },
      ])
      .returning('*');

    // Create sample horses for each race
    const horses = [];
    const horseNames = [
      'Verry Elleegant', 'Incentivise', 'Spanish Mission', 'Twilight Payment',
      'Sir Dragonet', 'Explosive Jack', 'Selino', 'Great House',
      'Delphi', 'Tralee Rose', 'Floating Artist', 'The Chosen One'
    ];

    for (const race of races) {
      for (let i = 0; i < 4; i++) {
        const horse = await knex('horses')
          .insert({
            name: horseNames[i],
            age: 4 + Math.floor(Math.random() * 3),
            sex: i % 2 === 0 ? 'mare' : 'gelding',
            color: ['Bay', 'Chestnut', 'Black', 'Grey'][i % 4],
            sire: 'Frankel',
            dam: 'Black Caviar',
            trainer: ['Chris Waller', 'Gai Waterhouse', 'Peter Moody'][i % 3],
            jockey: ['James McDonald', 'Hugh Bowman', 'Damien Oliver'][i % 3],
            weight: 56.5 + (Math.random() * 2),
            barrier: i + 1,
            race_id: race.id,
            number: i + 1,
            silk_colors: ['Blue and White', 'Red and Black', 'Green and Gold'][i % 3],
          })
          .returning('*');

        horses.push(horse[0]);

        // Add odds for each horse from each bookmaker
        if (bookmakers && bookmakers.length > 0) {
          for (const bookmaker of bookmakers) {
            await knex('odds_snapshots')
              .insert({
                race_id: race.id,
                horse_id: horse[0].id,
                bookmaker_id: bookmaker.id,
                win_odds: 2.5 + Math.random() * 20,
                place_odds: 1.5 + Math.random() * 5,
                timestamp: new Date(),
              });
          }
        }
      }
    }

    // Create sample news articles
    await knex('news')
      .insert([
        {
          title: 'Verry Elleegant Confirmed for Melbourne Cup',
          content: 'Champion mare Verry Elleegant has been confirmed as a starter for this year\'s Melbourne Cup. Trainer Chris Waller expressed confidence in her preparation.',
          summary: 'Verry Elleegant will run in the Melbourne Cup after successful preparation.',
          author: 'Racing Life Team',
          source_url: 'https://racinglife.com/news/1',
          image_url: 'https://images.unsplash.com/photo-1516673699707-4f2a243fafad',
          sentiment_score: 0.8,
          sentiment_label: 'positive',
          published_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          title: 'Track Conditions Perfect for Cox Plate',
          content: 'The track at Moonee Valley is in perfect condition for the Cox Plate. Officials report a Good 4 rating with ideal weather forecast.',
          summary: 'Perfect conditions expected for the Cox Plate at Moonee Valley.',
          author: 'Racing Life Team',
          source_url: 'https://racinglife.com/news/2',
          sentiment_score: 0.9,
          sentiment_label: 'positive',
          published_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          title: 'Incentivise Draws Wide Barrier',
          content: 'Favourite Incentivise has drawn barrier 15 for the Melbourne Cup, presenting a challenge for connections.',
          summary: 'Melbourne Cup favourite faces wide barrier draw challenge.',
          author: 'Racing Life Team',
          source_url: 'https://racinglife.com/news/3',
          sentiment_score: -0.3,
          sentiment_label: 'negative',
          published_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
      ]);

    // Create sample ambassador if user exists
    if (ambassadorUser) {
      const [ambassador] = await knex('ambassadors')
        .insert({
          user_id: ambassadorUser.id,
          bio: 'Professional racing analyst with over 20 years of experience in the industry.',
          expertise: 'Form analysis, track conditions, breeding',
          achievements: 'Multiple Group 1 winner predictions, Racing journalist of the year 2020',
          social_media_links: JSON.stringify({
            twitter: 'https://twitter.com/johnracing',
            instagram: 'https://instagram.com/johnracing',
          }),
          is_verified: true,
          commission_rate: 0.15,
        })
        .returning('*')
        .onConflict('user_id')
        .ignore();

      // Create sample articles
      if (ambassador) {
        await knex('articles')
          .insert([
            {
              ambassador_id: ambassador.id,
              title: 'Melbourne Cup 2024: Expert Analysis',
              content: 'Here\'s my comprehensive analysis of this year\'s Melbourne Cup field...',
              summary: 'Expert tips and analysis for the Melbourne Cup',
              status: 'published',
              published_at: new Date(),
              view_count: 1250,
            },
            {
              ambassador_id: ambassador.id,
              title: 'Cox Plate Preview: The Contenders',
              content: 'Breaking down the key runners in this year\'s Cox Plate...',
              summary: 'Detailed preview of Cox Plate runners',
              status: 'published',
              published_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
              view_count: 890,
            },
          ]);
      }
    }

    console.log('✅ Sample data seeded successfully!');
    console.log('📊 Created:');
    console.log('   - 2 users (admin & ambassador)');
    console.log('   - 3 bookmakers');
    console.log('   - 3 races');
    console.log('   - 12 horses');
    console.log('   - Odds for all horses');
    console.log('   - 3 news articles');
    console.log('   - 1 ambassador profile');
    console.log('   - 2 ambassador articles');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedSampleData();