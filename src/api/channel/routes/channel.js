'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/channels',
      handler: 'channel.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/channels/:id',
      handler: 'channel.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/channels',
      handler: 'channel.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/channels/:id',
      handler: 'channel.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/channels/:id',
      handler: 'channel.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'POST',
      path: '/channels/accept-invitation/:token',
      handler: 'channel.acceptInvitation',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
