const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOSTNAME,
  dialect: process.env.DB_DIALECT || 'mysql',
  operatorsAliases: false
};

if (process.env.DB_DISABLE_LOG) config['logging'] = false;

module.exports = config;