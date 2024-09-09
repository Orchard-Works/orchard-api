'use strict';

const { sanitizeEntity } = require('@strapi/utils');
const crypto = require('crypto');

module.exports = {

  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view invitations');
    }

    let invitations;
    if (user.role.name === 'Admin') {
      // If user is admin, fetch all invitations
      invitations = await strapi.entityService.findMany('api::invitation.invitation', {
        populate: ['organization', 'invitedBy'],
      });
    } else {
      // If user is not admin, fetch only invitations for organizations they manage
      const userOrganizations = await strapi.entityService.findMany('api::organisation.organisation', {
        filters: {
          admins: {
            id: user.id,
          },
        },
      });

      const organizationIds = userOrganizations.map(org => org.id);

      invitations = await strapi.entityService.findMany('api::invitation.invitation', {
        filters: {
          organization: {
            id: {
              $in: organizationIds,
            },
          },
        },
        populate: ['organization', 'invitedBy'],
      });
    }

    return invitations.map(invitation => sanitizeEntity(invitation, { model: strapi.contentTypes['api::invitation.invitation'] }));
  },



  async create(ctx) {
    const { email, organizationId } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to invite users');
    }

    const organization = await strapi.services.organisation.findOne({ id: organizationId });
    if (!organization) {
      return ctx.notFound('Organization not found');
    }

    // Check if the user has permission to invite to this organization
    // This would depend on your permission structure

    const token = crypto.randomBytes(32).toString('hex');

    const invitation = await strapi.services.invitation.create({
      email,
      organization: organizationId,
      invitedBy: user.id,
      token,
      status: 'pending'
    });

    // Send invitation email
    await strapi.plugins['email'].services.email.send({
      to: email,
      subject: 'Invitation to join an organization on Orchard.works',
      text: `You've been invited to join ${organization.name} on Orchard.works. Click here to accept: ${process.env.FRONTEND_URL}/invite/${token}`,
      html: `<p>You've been invited to join ${organization.name} on Orchard.works.</p><p><a href="${process.env.FRONTEND_URL}/invite/${token}">Click here to accept</a></p>`
    });

    return sanitizeEntity(invitation, { model: strapi.models.invitation });
  },

  async accept(ctx) {
    const { token } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to accept an invitation');
    }

    const invitation = await strapi.services.invitation.findOne({ token });
    if (!invitation) {
      return ctx.notFound('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      return ctx.badRequest('This invitation has already been processed');
    }

    // Update invitation status
    await strapi.services.invitation.update(
      { id: invitation.id },
      { status: 'accepted' }
    );

    // Add user to organization
    await strapi.services.organisation.update(
      { id: invitation.organization.id },
      { users: [...invitation.organization.users, user.id] }
    );

    return { message: 'Invitation accepted successfully' };
  },

  async list(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view invitations');
    }

    // This assumes you have a way to check if a user is an admin of an organization
    // You might need to adjust this based on your permission structure
    const invitations = await strapi.services.invitation.find({
      invitedBy: user.id,
      status: 'pending'
    });

    return invitations.map(invitation => sanitizeEntity(invitation, { model: strapi.models.invitation }));
  }
};
