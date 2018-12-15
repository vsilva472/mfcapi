module.exports = {
    development: {
        secret: process.env.DEV_JWT_SECRET,
        ttl: process.env.DEV_JWT_TTL,
        refreshTTL: process.env.DEV_JWT_REFRESH_TTL,
        refreshSecret: process.env.DEV_JWT_REFRESH_SECRET,
    },
    test: {
        secret: process.env.CI_JWT_SECRET,
        ttl: process.env.CI_JWT_TTL,
        refreshTTL: process.env.CI_JWT_REFRESH_TTL,
        refreshSecret: process.env.CI_JWT_REFRESH_SECRET,
    },
    production: {
        secret: process.env.PROD_JWT_SECRET,
        ttl: process.env.PROD_JWT_TTL,
        refreshTTL: process.env.PROD_JWT_REFRESH_TTL,
        refreshSecret: process.env.PROD_JWT_REFRESH_SECRET,
    }
};