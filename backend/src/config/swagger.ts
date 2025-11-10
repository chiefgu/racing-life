/**
 * Swagger/OpenAPI Configuration
 * Generates interactive API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Racing Life API',
      version: '1.0.0',
      description: 'Comprehensive API for horse racing odds comparison, news, and betting information',
      contact: {
        name: 'Racing Life API Support',
        email: 'support@racinglife.com',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.racinglife.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for external access',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['user', 'ambassador', 'admin'],
              example: 'user',
            },
            subscription_tier: {
              type: 'string',
              enum: ['free', 'basic', 'premium'],
              example: 'free',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Race: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Melbourne Cup',
            },
            venue: {
              type: 'string',
              example: 'Flemington',
            },
            race_time: {
              type: 'string',
              format: 'date-time',
            },
            race_type: {
              type: 'string',
              example: 'Thoroughbred',
            },
            distance: {
              type: 'integer',
              example: 3200,
            },
            class: {
              type: 'string',
              example: 'Group 1',
            },
            prize_money: {
              type: 'integer',
              example: 8000000,
            },
            going: {
              type: 'string',
              example: 'Good',
            },
            status: {
              type: 'string',
              enum: ['upcoming', 'live', 'completed', 'cancelled'],
              example: 'upcoming',
            },
          },
        },
        Runner: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            race_id: {
              type: 'integer',
              example: 1,
            },
            horse_name: {
              type: 'string',
              example: 'Thunder Bolt',
            },
            jockey: {
              type: 'string',
              example: 'J. Smith',
            },
            trainer: {
              type: 'string',
              example: 'T. Jones',
            },
            age: {
              type: 'integer',
              example: 4,
            },
            weight: {
              type: 'number',
              format: 'float',
              example: 57.5,
            },
            draw: {
              type: 'integer',
              example: 5,
            },
            form: {
              type: 'string',
              example: '1-2-1-3',
            },
          },
        },
        Odds: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            runner_id: {
              type: 'integer',
              example: 1,
            },
            bookmaker_id: {
              type: 'integer',
              example: 1,
            },
            win_odds: {
              type: 'number',
              format: 'float',
              example: 5.5,
            },
            place_odds: {
              type: 'number',
              format: 'float',
              example: 2.1,
              nullable: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Bookmaker: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Bet365',
            },
            slug: {
              type: 'string',
              example: 'bet365',
            },
            logo_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/logo.png',
            },
            affiliate_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/affiliate',
            },
            is_active: {
              type: 'boolean',
              example: true,
            },
          },
        },
        NewsArticle: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Horse Racing News Title',
            },
            content: {
              type: 'string',
              example: 'Article content...',
            },
            source: {
              type: 'string',
              example: 'Racing Post',
            },
            author: {
              type: 'string',
              example: 'John Reporter',
            },
            published_at: {
              type: 'string',
              format: 'date-time',
            },
            image_url: {
              type: 'string',
              format: 'uri',
              nullable: true,
            },
            sentiment_score: {
              type: 'number',
              format: 'float',
              example: 0.75,
              nullable: true,
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Races',
        description: 'Race information and management',
      },
      {
        name: 'Odds',
        description: 'Odds data and comparison',
      },
      {
        name: 'Bookmakers',
        description: 'Bookmaker information',
      },
      {
        name: 'News',
        description: 'Racing news and articles',
      },
      {
        name: 'Watchlist',
        description: 'User watchlist management',
      },
      {
        name: 'Preferences',
        description: 'User preferences and settings',
      },
      {
        name: 'Ambassadors',
        description: 'Ambassador program management',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Racing Life API Documentation',
  }));

  // Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export default swaggerSpec;
