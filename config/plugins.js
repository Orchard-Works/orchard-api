module.exports = ({env}) => ({
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

