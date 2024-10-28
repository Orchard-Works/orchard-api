// src/api/agora-token/controllers/agora-token.js

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

module.exports = createCoreController('api::agora-token.agora-token', ({ strapi }) => ({
  generateToken: async (ctx) => {
    try {
      const {
        channelName,
        uid,
        role = 'publisher',
        tokenType = 'rtc',
        expirationTimeInSeconds = 3600,
        organisationId = 42
      } = ctx.request.body;

      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;

      if (!appId || !appCertificate) {
        return ctx.throw(500, 'Agora credentials not configured');
      }

      if (!channelName) {
        return ctx.throw(400, 'Channel name is required');
      }

      if (!organisationId) {
        return ctx.throw(400, 'Organisation ID is required');
      }

      // Verify the organisation exists and user has access
      const organisation = await strapi.entityService.findOne('api::organisation.organisation', organisationId, {
        populate: ['users']
      });

      if (!organisation) {
        return ctx.throw(404, 'Organisation not found');
      }

      // Check if user belongs to organisation
      const userHasAccess = organisation.users.some(user => user.id === ctx.state.user.id);
      if (!userHasAccess) {
        return ctx.throw(403, 'User does not have access to this organisation');
      }

      // Current timestamp in seconds
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Generate the token
      let token;
      if (tokenType === 'rtc') {
        token = RtcTokenBuilder.buildTokenWithUid(
          appId,
          appCertificate,
          channelName,
          uid || 0,
          role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
          privilegeExpiredTs
        );
      } else {
        return ctx.throw(400, 'Unsupported token type');
      }

      // Save token details in database
      const tokenRecord = await strapi.entityService.create('api::agora-token.agora-token', {
        data: {
          channelName,
          token,
          expiresAt: new Date(privilegeExpiredTs * 1000),
          user: ctx.state.user.id,
          organisation: organisationId,  // Use the provided organisationId
          publishedAt: new Date(),
        },
      });

      return {
        token,
        appId,
        expiresIn: expirationTimeInSeconds,
      };
    } catch (error) {
      console.error('Token generation error:', error);
      return ctx.throw(500, 'Failed to generate token');
    }
  },

  renewToken: async (ctx) => {
    try {
      const { channelName, currentToken, organisationId } = ctx.request.body;

      if (!organisationId) {
        return ctx.throw(400, 'Organisation ID is required');
      }

      // Verify current token exists and belongs to user
      const existingTokens = await strapi.entityService.findMany('api::agora-token.agora-token', {
        filters: {
          token: currentToken,
          user: ctx.state.user.id,
          organisation: organisationId
        },
      });

      if (!existingTokens || existingTokens.length === 0) {
        return ctx.throw(403, 'Invalid token');
      }

      const existingToken = existingTokens[0];

      // Verify organisation access
      const organisation = await strapi.entityService.findOne('api::organisation.organisation', organisationId, {
        populate: ['users']
      });

      if (!organisation) {
        return ctx.throw(404, 'Organisation not found');
      }

      const userHasAccess = organisation.users.some(user => user.id === ctx.state.user.id);
      if (!userHasAccess) {
        return ctx.throw(403, 'User does not have access to this organisation');
      }

      // Generate new token with extended expiration
      const newExpirationTimeInSeconds = 3600; // 1 hour
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + newExpirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        process.env.AGORA_APP_ID,
        process.env.AGORA_APP_CERTIFICATE,
        channelName,
        0,
        RtcRole.PUBLISHER,
        privilegeExpiredTs
      );

      // Update token in database
      await strapi.entityService.update('api::agora-token.agora-token', existingToken.id, {
        data: {
          token,
          expiresAt: new Date(privilegeExpiredTs * 1000),
          publishedAt: new Date(),
        },
      });

      return {
        token,
        appId: process.env.AGORA_APP_ID,
        expiresIn: newExpirationTimeInSeconds,
      };
    } catch (error) {
      console.error('Token renewal error:', error);
      return ctx.throw(500, 'Failed to renew token');
    }
  },
}));
