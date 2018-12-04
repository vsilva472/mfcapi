module.exports = {
    development: {
        secret: process.env.DEV_JWT_SECRET,
        ttl: process.env.DEV_JWT_TTL
    },
    test: {
        secret: process.env.CI_JWT_SECRET,
        ttl: process.env.CI_JWT_TTL
    },
    production: {
        secret: process.env.PROD_JWT_SECRET,
        ttl: process.env.PROD_JWT_TTL
    }
};