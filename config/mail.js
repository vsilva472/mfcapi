module.exports = {
    development: {
        host: process.env.DEV_MAIL_HOST,
        port: process.env.DEV_MAIL_PORT,
        from: process.env.DEV_MAIL_FROM,
        user: process.env.DEV_MAIL_USERNAME,
        pass: process.env.DEV_MAIL_PASSWORD
    },
    test: {
        host: process.env.CI_MAIL_HOST,
        port: process.env.CI_MAIL_PORT,
        from: process.env.CI_MAIL_FROM,
        user: process.env.CI_MAIL_USERNAME,
        pass: process.env.CI_MAIL_PASSWORD
    },
    production: {
        host: process.env.PROD_MAIL_HOST,
        port: process.env.PROD_MAIL_PORT,
        from: process.env.PROD_MAIL_FROM,
        user: process.env.PROD_MAIL_USERNAME,
        pass: process.env.PROD_MAIL_PASSWORD
    }
};