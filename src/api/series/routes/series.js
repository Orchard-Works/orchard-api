// src/api/series/routes/series.js
'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/series',
      handler: 'series.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/series/:id',
      handler: 'series.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/series',
      handler: 'series.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/series/:id',
      handler: 'series.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/series/:id',
      handler: 'series.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/series/:id/episode-order',
      handler: 'series.updateEpisodeOrder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
