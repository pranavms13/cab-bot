module.exports = {
  apps: [
    {
      name: "cab-bot",
      script: "dist/app.js",
      instances: 1,
      autorestart: false,
      watch: false,
    },
  ],
};
