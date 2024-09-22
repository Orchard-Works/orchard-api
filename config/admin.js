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
});
