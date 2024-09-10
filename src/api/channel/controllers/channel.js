'use strict';

/**
 * channel controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::channel.channel', ({ strapi }) => ({
  // Find all channels
  async find(ctx) {
    try {
      const channels = await strapi.entityService.findMany('api::channel.channel', {
        ...ctx.query,
      });
      return channels;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Find a specific channel
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const channel = await strapi.entityService.findOne('api::channel.channel', id, {
        ...ctx.query,
      });
      if (!channel) return ctx.notFound();
      return channel;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Create a new channel
  async create(ctx) {
    try {
      const { name, description, organisationId, isInternal, invitedEmails } = ctx.request.body;

      if (!name || !organisationId) {
        return ctx.badRequest('Name and organisation ID are required');
      }

      const channel = await strapi.entityService.create('api::channel.channel', {
        data: {
          name,
          description,
          organisation: organisationId,
          isInternal: isInternal || false,
          publishedAt: new Date(),
        },
      });

      // Handle invitations logic here (if needed)
      if (invitedEmails && Array.isArray(invitedEmails)) {
        // Implement invitation logic
      }

      return channel;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Update a channel
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedChannel = await strapi.entityService.update('api::channel.channel', id, {
        data: updateData,
      });
      return updatedChannel;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Delete a channel
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const deletedChannel = await strapi.entityService.delete('api::channel.channel', id);
      return deletedChannel;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Accept invitation to a channel
  async acceptInvitation(ctx) {
    try {
      const { token } = ctx.params;
      const { user } = ctx.state;

      if (!user) {
        return ctx.unauthorized('You must be logged in to accept an invitation');
      }

      // Implement your invitation acceptance logic here
      // This is a placeholder implementation
      const invitation = await strapi.entityService.findMany('api::channel-invitation.channel-invitation', {
        filters: { token },
        populate: ['channel'],
      });

      if (!invitation || invitation.length === 0) {
        return ctx.notFound('Invitation not found');
      }

      const channelInvitation = invitation[0];

      if (channelInvitation.status !== 'pending') {
        return ctx.badRequest('This invitation has already been processed');
      }

      // Update invitation status
      await strapi.entityService.update('api::channel-invitation.channel-invitation', channelInvitation.id, {
        data: { status: 'accepted' },
      });

      // Add user to channel
      await strapi.entityService.update('api::channel.channel', channelInvitation.channel.id, {
        data: { users: { connect: [user.id] } },
      });

      return { message: 'Invitation accepted successfully' };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
