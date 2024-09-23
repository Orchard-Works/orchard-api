'use strict';

/**
 * channel controller
 */

const {createCoreController} = require('@strapi/strapi').factories;
const crypto = require('crypto');


module.exports = createCoreController('api::channel.channel', ({strapi}) => ({
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
      const {id} = ctx.params;
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
    const {name, description, organisationId, isInternal, invitedEmails} = ctx.request.body;

    // Create the channel
    const channel = await strapi.entityService.create('api::channel.channel', {
      data: {
        name,
        description,
        organisation: organisationId,
        isInternal,
        publishedAt: new Date(),
      },
    });

    // Send invitations
    if (invitedEmails && invitedEmails.length > 0) {
      for (const email of invitedEmails) {
        try {
          const token = crypto.randomBytes(32).toString('hex');

          // Create the invitation link
          const invitationLink = `${strapi.config.get('server.frontendUrl')}/channel-invite/${token}`;
          const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Channel Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f0f7ff; border-radius: 10px; padding: 20px; text-align: center;">
        <img src="https://i.ibb.co/gyLFyZ2/logo-1.png" alt="Orchard Logo" style="width: 50px; margin-bottom: 20px;">
        <h1 style="color: #0066cc; margin-bottom: 20px;">You're Invited!</h1>
        <p style="font-size: 18px; margin-bottom: 30px;">
            You've been invited to join the channel <strong style="color: #0066cc;">"${name}"</strong>.
        </p>
        <a href="${invitationLink}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
    </div>
    <div style="margin-top: 30px; text-align: center; color: #666;">
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>© ${new Date().getFullYear()} Orchard.works. All rights reserved.</p>
    </div>
</body>
</html>
`;


          await strapi.plugins['email'].services.email.send({
            to: email,
            subject: `Invitation to join channel "${name}"`,
            text: `You've been invited to join the channel "${name}". Click here to accept: ${invitationLink}`,
            html: emailHtml
          });

          // Create an invitation record in the database
          await strapi.entityService.create('api::channel-invitation.channel-invitation', {
            data: {
              email,
              channel: channel.id,
              status: 'pending',
              token,
            },
          });
        } catch (error) {
          console.error(`Failed to send invitation email to ${email}:`, error);
        }
      }
    }

    return channel;
  },

  // Update a channel
  async update(ctx) {
    try {
      const {id} = ctx.params;
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
      const {id} = ctx.params;
      const deletedChannel = await strapi.entityService.delete('api::channel.channel', id);
      return deletedChannel;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Accept invitation to a channel
  async acceptInvitation(ctx) {
    const {token} = ctx.params;
    const user = ctx.state.user;


    const invitation = await strapi.entityService.findMany('api::channel-invitation.channel-invitation', {
      filters: {token},
      populate: ['channel'],
    });

    if (!invitation || invitation.length === 0) {
      return ctx.notFound('Invitation not found');
    }

    const channelInvitation = invitation[0];

    if (channelInvitation.status !== 'pending') {
      return ctx.badRequest('This invitation has already been processed');
    }

    if (!user) {
      return {
        status: 'unauthenticated',
        email: channelInvitation.email,
        channelName: channelInvitation.channel.name,
        organisationId: channelInvitation.channel.organisation.id,
      };
    }

    await strapi.entityService.update('api::channel-invitation.channel-invitation', channelInvitation.id, {
      data: {status: 'accepted'},
    });

    await strapi.entityService.update('api::channel.channel', channelInvitation.channel.id, {
      data: {users: {connect: [user.id]}},
    });

    return {status: 'accepted', message: 'Invitation accepted successfully'};
  },
  async checkInvitation(ctx) {
    const {token} = ctx.params;

    const invitation = await strapi.entityService.findMany('api::channel-invitation.channel-invitation', {
      filters: {token},
      populate: ['channel.organisation'],
    });

    if (!invitation || invitation.length === 0) {
      return ctx.notFound('Invitation not found');
    }

    const channelInvitation = invitation[0];

    if (channelInvitation.status !== 'pending') {
      return ctx.badRequest('This invitation has already been processed');
    }

    if (!ctx.state.user) {
      return {
        status: 'unauthenticated',
        email: channelInvitation.email,
        channelName: channelInvitation.channel.name,
        organisationName: channelInvitation.channel.organisation.name,
      };
    }

    return {status: 'authenticated'};
  },
  async inviteUsers(ctx) {
    const {id} = ctx.params;
    const {emails} = ctx.request.body;

    const channel = await strapi.entityService.findOne('api::channel.channel', id, {
      populate: ['organisation'],
    });

    if (!channel) {
      return ctx.notFound('Channel not found');
    }

    for (const email of emails) {
      try {
        const token = crypto.randomBytes(32).toString('hex');
        const invitationLink = `${strapi.config.get('server.frontendUrl')}/channel-invite/${token}`;
        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Channel Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f0f7ff; border-radius: 10px; padding: 20px; text-align: center;">
        <img src="https://i.ibb.co/gyLFyZ2/logo-1.png" alt="Orchard Logo" style="width: 100px; margin-bottom: 20px;">
        <h1 style="color: #0066cc; margin-bottom: 20px;">You're Invited!</h1>
        <p style="font-size: 18px; margin-bottom: 30px;">
            You've been invited to join the channel <strong style="color: #0066cc;">"${channel.name}"</strong>.
        </p>
        <a href="${invitationLink}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
    </div>
    <div style="margin-top: 30px; text-align: center; color: #666;">
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>© ${new Date().getFullYear()} Orchard.works. All rights reserved.</p>
    </div>
</body>
</html>
`;


        await strapi.plugins['email'].services.email.send({
          to: email,
          subject: `Invitation to join channel "${channel.name}"`,
          html: emailHtml,
        });


        await strapi.entityService.create('api::channel-invitation.channel-invitation', {
          data: {
            email,
            channel: id,
            status: 'pending',
            token,
          },
        });
      } catch (error) {
        console.error(`Failed to send invitation email to ${email}:`, error);
      }
    }

    return {message: 'Invitations sent successfully'};
  },
}));
