module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/agora/token',
      handler: 'agora-token.generateToken',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/agora/token/renew',
      handler: 'agora-token.renewToken',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
