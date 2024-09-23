module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  url: env('PUBLIC_URL', 'https://orchard-backend.deant.work'),
  admin: {
    url: env('ADMIN_PATH', '/admin'),
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  },
  frontendUrl: env('FRONTEND_URL', 'http://localhost:3000'),
});
