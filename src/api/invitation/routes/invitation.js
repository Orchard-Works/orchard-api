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
      method: 'GET',
      path: '/invitations/check/:token',
      handler: 'invitation.checkInvitation',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/invitations/accept/:token',
      handler: 'invitation.accept',
      config: {
        policies: [],
      },
    },
  ],
};
