// config/loadConfig.js
module.exports = async function loadConfig() {
  return {
    adminEmail: process.env.ADMIN_EMAIL,
  };
};
