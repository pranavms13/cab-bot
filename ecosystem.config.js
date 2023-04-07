module.exports = {
  apps: [
    {
      name: "cab-bot",
      script: "dist/app.js",
      instances: 2,
      autorestart: false,
      watch: false,
    },
  ],
};
