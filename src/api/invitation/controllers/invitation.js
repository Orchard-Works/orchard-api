const { createCoreController } = require('@strapi/strapi').factories;
const crypto = require('crypto');

module.exports = createCoreController('api::invitation.invitation', ({ strapi }) => ({
  async create(ctx) {
    const { emails, invitationType, targetId } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create invitations');
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return ctx.badRequest('Emails must be provided as a non-empty array');
    }

    const invitations = [];

    for (const email of emails) {
      const invitationData = {
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

      const invitation = await strapi.entityService.create('api::invitation.invitation', {
        data: invitationData,
        populate: ['organisation', 'channel', 'series']
      });
      invitations.push(invitation);

      // Send invitation email
      await this.sendInvitationEmail(invitation);
    }

    return { invitations };
  },

  async accept(ctx) {
    const { token } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to accept an invitation');
    }

    console.log(token)

    const invitation = await strapi.entityService.findMany('api::invitation.invitation', {
      filters: { token: token },
      populate: ['organisation', 'channel', 'series'],
    });

    if (!invitation || invitation.length === 0) {
      return ctx.notFound('Invitation not found');
    }

    const invitationData = invitation[0];

    if (invitationData.status !== 'pending') {
      return ctx.badRequest('This invitation has already been processed');
    }

    // Update invitation status
    await strapi.entityService.update('api::invitation.invitation', invitationData.id, { data: { status: 'accepted' } });

    switch (invitationData.invitationType) {
      case 'organisation':
        await this.addUserToOrganisation(user.id, invitationData.organisation.id);
        break;
      case 'channel':
        await this.addUserToChannel(user.id, invitationData.channel.id);
        break;
      case 'series':
        await this.addUserToSeries(user.id, invitationData.series.id);
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
        invitationLink = `${strapi.config.get('server.frontendUrl')}/invite/organisation/${invitation.token}`;
        break;
      case 'channel':
        targetName = invitation.channel.name;
        invitationLink = `${strapi.config.get('server.frontendUrl')}/invite/channel/${invitation.token}`;
        break;
      case 'series':
        targetName = invitation.series.name;
        invitationLink = `${strapi.config.get('server.frontendUrl')}/invite/series/${invitation.token}`;
        break;
    }

    const emailTemplate = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to Orchard.works</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f0f7ff;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
        }
        .logo {
            width: 100px;
            margin-bottom: 20px;
        }
        h1 {
            color: #f5755a;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            background-color: #f5755a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>You're Invited!</h1>
        <p>You've been invited to join <strong>${targetName}</strong> on Orchard.works, the Intelligent Visual Data Platform.</p>
        <p>Orchard.works enables effective communication, training, and education through visual artifacts such as animations and infographics.</p>
        <a href="${invitationLink}" class="button" style="color: white">Accept Invitation</a>
    </div>
    <div class="footer">
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>© ${new Date().getFullYear()} Orchard.works. All rights reserved.</p>
    </div>
</body>
</html>
    `;

    await strapi.plugins['email'].services.email.send({
      to: invitation.email,
      subject: `Invitation to join ${targetName} on Orchard.works`,
      html: emailTemplate,
    });
  },

  async checkInvitation(ctx) {
    const { token } = ctx.params;

    try {
      const invitation = await strapi.entityService.findMany('api::invitation.invitation', {
        filters: { token: token },
        populate: ['organisation', 'channel', 'series'],
      });

      if (!invitation || invitation.length === 0) {
        return ctx.notFound('Invitation not found');
      }

      const invitationData = invitation[0];

      if (invitationData.status !== 'pending') {
        return ctx.badRequest('This invitation has already been processed');
      }

      let entityName, entityType;
      switch (invitationData.invitationType) {
        case 'organisation':
          entityName = invitationData.organisation.name;
          entityType = 'Organisation';
          break;
        case 'channel':
          entityName = invitationData.channel.name;
          entityType = 'Channel';
          break;
        case 'series':
          entityName = invitationData.series.name;
          entityType = 'Series';
          break;
        default:
          return ctx.badRequest('Invalid invitation type');
      }

      return {
        email: invitationData.email,
        entityName,
        entityType,
        invitationType: invitationData.invitationType,
      };

    } catch (err) {
      ctx.throw(500, 'Error checking invitation');
    }
  },
}));
