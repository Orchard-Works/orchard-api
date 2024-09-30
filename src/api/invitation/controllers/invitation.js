const { createCoreController } = require('@strapi/strapi').factories;
const crypto = require('crypto');

module.exports = createCoreController('api::invitation.invitation', ({ strapi }) => ({
  async create(ctx) {
    const { email, invitationType, targetId } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create invitations');
    }

    let invitationData = {
      email,
      invitationType,
      invitedBy: user.id,
      status: 'pending',
      token: crypto.randomBytes(32).toString('hex')
    };

    switch (invitationType) {
      case 'organisation':
        invitationData.organisation = targetId;
        break;
      case 'channel':
        invitationData.channel = targetId;
        break;
      case 'series':
        invitationData.series = targetId;
        break;
      default:
        return ctx.badRequest('Invalid invitation type');
    }

    const invitation = await strapi.entityService.create('api::invitation.invitation', { data: invitationData });

    // Send invitation email
    await this.sendInvitationEmail(invitation);

    return invitation;
  },

  async accept(ctx) {
    const { token } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to accept an invitation');
    }

    const invitation = await strapi.entityService.findOne('api::invitation.invitation', { token }, { populate: ['organisation', 'channel', 'series'] });

    if (!invitation) {
      return ctx.notFound('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      return ctx.badRequest('This invitation has already been processed');
    }

    // Update invitation status
    await strapi.entityService.update('api::invitation.invitation', invitation.id, { data: { status: 'accepted' } });

    switch (invitation.invitationType) {
      case 'organisation':
        await this.addUserToOrganisation(user.id, invitation.organisation.id);
        break;
      case 'channel':
        await this.addUserToChannel(user.id, invitation.channel.id);
        break;
      case 'series':
        await this.addUserToSeries(user.id, invitation.series.id);
        break;
    }

    return { message: 'Invitation accepted successfully' };
  },

  async addUserToOrganisation(userId, organisationId) {
    // Add user to the organization
    await strapi.entityService.update('api::organisation.organisation', organisationId, {
      data: { users: { connect: [userId] } }
    });

    // Find all channels associated with this organization
    const channels = await strapi.entityService.findMany('api::channel.channel', {
      filters: { organisation: organisationId },
    });

    // Add user to all channels of the organization
    for (const channel of channels) {
      await this.addUserToChannel(userId, channel.id);
    }
  },

  async addUserToChannel(userId, channelId) {
    await strapi.entityService.update('api::channel.channel', channelId, {
      data: { users: { connect: [userId] } }
    });
  },

  async addUserToSeries(userId, seriesId) {
    await strapi.entityService.update('api::series.series', seriesId, {
      data: { users: { connect: [userId] } }
    });
  },

  async sendInvitationEmail(invitation) {
    let targetName, invitationLink;

    switch (invitation.invitationType) {
      case 'organisation':
        targetName = invitation.organisation.name;
        invitationLink = `${process.env.FRONTEND_URL}/invite/organisation/${invitation.token}`;
        break;
      case 'channel':
        targetName = invitation.channel.name;
        invitationLink = `${process.env.FRONTEND_URL}/invite/channel/${invitation.token}`;
        break;
      case 'series':
        targetName = invitation.series.name;
        invitationLink = `${process.env.FRONTEND_URL}/invite/series/${invitation.token}`;
        break;
    }

    const emailTemplate = `
      <h1>You've been invited!</h1>
      <p>You've been invited to join ${targetName} on Orchard.works.</p>
      <p><a href="${invitationLink}">Click here to accept the invitation</a></p>
    `;

    await strapi.plugins['email'].services.email.send({
      to: invitation.email,
      subject: `Invitation to join ${targetName} on Orchard.works`,
      html: emailTemplate,
    });
  }
}));
