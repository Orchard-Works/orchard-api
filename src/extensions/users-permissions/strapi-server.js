// Path: src/extensions/users-permissions/strapi-server.js

module.exports = (plugin) => {
  plugin.controllers.auth.register = async (ctx) => {
    const { email, password, username, firstName,lastName } = ctx.request.body;
    const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const settings = await pluginStore.get({ key: 'advanced' });

    if (!email || !password || !username) {
      return ctx.badRequest('Email, password, and username are required');
    }

    const existingUser = await strapi.query('plugin::users-permissions.user').findOne({ where: { email } });
    if (existingUser) {
      return ctx.conflict('This email is already registered');
    }

    try {
      const newUser = await strapi.plugins['users-permissions'].services.user.add({
        email,
        password,
        username,
        firstName,
        lastName
      });

      if (settings.email_confirmation) {
        strapi
          .service('plugin::users-permissions.user')
          .sendConfirmationEmail(newUser);
      }

      return ctx.send({ user: newUser }, 201);
    } catch (error) {
      return ctx.throw(500, 'Unable to register user');
    }
  };

  return plugin;
};
