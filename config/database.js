const path = require('path');

module.exports = ({ env }) => {
  const client = 'postgres';

  const connections = {
    postgres: {
      connection: {
        host: env('DATABASE_HOST', 'aws-0-eu-central-1.pooler.supabase.com'),
        port: env.int('DATABASE_PORT', 6543),
        database: env('DATABASE_NAME', 'postgres'),
        user: env('DATABASE_USERNAME', 'postgres.qpiztsshbfbynliwozjs'),
        password: env('DATABASE_PASSWORD', 'SkGO5Ku6bF70b7S7'),
        ssl: env.bool('DATABASE_SSL', false),
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
