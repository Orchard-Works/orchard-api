'use strict';

/**
 * agora-token service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::agora-token.agora-token');
