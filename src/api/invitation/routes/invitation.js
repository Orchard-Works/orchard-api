'use strict';
'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/invitations',
      handler: 'invitation.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/invitations',
      handler: 'invitation.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/invitations/:token/accept',
      handler: 'invitation.accept',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/invitations/check/:type/:token',
      handler: 'invitation.checkInvitation',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/invitations/accept/:type/:token',
      handler: 'invitation.accept',
      config: {
        policies: [],
      },
    },
  ],
};
