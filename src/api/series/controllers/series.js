'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::series.series', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::series.series').findOne(id, {
      ...query,
      populate: ['episodes'],
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    // Sort episodes by order
    if (sanitizedEntity.episodes) {
      sanitizedEntity.episodes.sort((a, b) => a.order - b.order);
    }

    return this.transformResponse(sanitizedEntity);
  },

  async updateEpisodeOrder(ctx) {
    const { id } = ctx.params;
    const { episodeOrder } = ctx.request.body;

    const series = await strapi.service('api::series.series').findOne(id, {
      populate: ['episodes'],
    });

    if (!series) {
      return ctx.notFound('Series not found');
    }

    // Update the order of each episode
    for (const orderUpdate of episodeOrder) {
      await strapi.service('api::episode.episode').update(orderUpdate.id, {
        data: { order: orderUpdate.order },
      });
    }

    // Fetch the updated series with sorted episodes
    const updatedSeries = await strapi.service('api::series.series').findOne(id, {
      populate: ['episodes'],
    });

    updatedSeries.episodes.sort((a, b) => a.order - b.order);

    return this.transformResponse(updatedSeries);
  },
}));
