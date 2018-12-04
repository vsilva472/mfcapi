module.exports = {
    development: {
      username: 'root',
      password: null,
      database: 'mfcapi_dev',
      host: '127.0.0.1',
      dialect: 'mysql'
    },
    test: {
      username: process.env.CI_DB_USERNAME,
      password: process.env.CI_DB_PASSWORD,
      database: process.env.CI_DB_NAME,
      host: '127.0.0.1',
      dialect: 'mysql',
      logging: false
    },
    production: {
      username: process.env.PROD_DB_USERNAME,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: process.env.PROD_DB_HOSTNAME,
      dialect: 'mysql'
    }
};