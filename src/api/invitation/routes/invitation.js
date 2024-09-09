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
  ],
};
