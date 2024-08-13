module.exports = () => ({
  "netlify-deployments": {
    enabled: true,
    config: {
      accessToken: "nfp_s8xyn233gEmcX16crsDyDTXVvcj4qLqs157e",

      sites:[
        {
          name: 'orchard-works-api',
          id: "30102000-d4d0-4f59-9e41-1f94cbcead13",
          buildHook:"https://api.netlify.com/build_hooks/66baf05d2f3b1aab05e3fe34",
        }
      ]
    },
  },
});

