'use strict';

/**
 * channel-invitation service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::channel-invitation.channel-invitation');
