module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http://localhost:*', 'ws://localhost:*'],
          'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:*', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'http://localhost:*', 'https:'],
          'upgradeInsecureRequests': null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::favicon',
  'strapi::public',
];
