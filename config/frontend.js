module.exports = {
    development: {
        frontend_url: 'http://localhost/expegoo/',
        frontend_imgs: 'http://localhost/expegoo/imgs/',
        frontend_password: 'http://localhost/expegoo/password/reset/?token='
    },
    test: {
        frontend_url: process.env.CI_SITE_URL,
        frontend_imgs: process.env.CI_SITE_IMGS_URL,
        frontend_password: process.env.CI_SITE_REC_PASS_URL
    },
    production: {
        frontend_url: process.env.PROD_SITE_URL,
        frontend_imgs: process.env.PROD_SITE_IMGS_URL,
        frontend_password: process.env.PROD_SITE_REC_PASS_URL
    }
};