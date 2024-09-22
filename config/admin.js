module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: "tobemodified",
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  url: env('PUBLIC_URL', '/admin'),
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  watchIgnoreFiles: [
    '**/config/sync/**',
  ],
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    watchIgnoreFiles: [
      '**/config/sync/**',
    ],
    security: {
      csrf: {
        enabled: false,
      },
    },
  },
});
