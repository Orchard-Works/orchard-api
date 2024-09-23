module.exports = ({ env }) => ({
  auth: {
    secret: "tobemodified",
  },
  apiToken: {
    salt: "tobemodified",
  },
  transfer: {
    token: {
      salt: "tobemodified",
    },
  },
  flags: {
    nps: true,
    promoteEE: true,
  },
  url: env('STRAPI_ADMIN_BACKEND_URL', 'https://orchard-backend.deant.work'),});
