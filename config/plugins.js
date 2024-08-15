module.exports = ({env}) => ({
  "netlify-deployments": {
    enabled: true,
    config: {
      accessToken: env("NETLIFY_ACCESS_TOKEN"),

      sites:[
        {
          name: 'orchard-works-api',
          id: env("NETLIFY_SITE_ID"),
          buildHook: env("NETLIFY_BUILD_HOOK"),
        }
      ]
    },
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "dean@harvestanimation.com",
        defaultReplyTo: "dean@harvestanimation.com",
      },
    },
  },
});

