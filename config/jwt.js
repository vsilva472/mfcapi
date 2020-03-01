module.exports = {
    secret: process.env.JWT_SECRET,
    ttl: process.env.JWT_TTL,
    refreshTTL: process.env.JWT_REFRESH_TTL,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
};