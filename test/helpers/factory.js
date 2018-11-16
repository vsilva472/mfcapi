const models = require( '../../models' );

const jwt           = require( 'jsonwebtoken' );
const jwtConfig     = require( '../../config/jwt' );

const randomDigits  = require( '../../modules/random-numbers' ); 

const factory = {
    createTokenForUser: ( user ) => {
        return jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );
    },
    createUser: async ( email = null, role = 'user', name = 'my name', password = '123456' ) => {
        if ( ! email ) email = `u_${new Date().getTime()}@gmail.com`;
        return await models.User.create({ name, role, email, password });
    },
    createFavorite: async ( UserId ) => {
        return await models.Favorite.create({ UserId, label: "My Favorite", value: 21.77, type: 1 });
    },
    createEntry: async ( UserId, label = 'My Entry' , type = 1, value = 7.99, registeredAt = new Date() ) => {
        return await models.Entry.create({ UserId, label, type, value, registeredAt });
    },
    createCategory: async ( UserId, label = 'My Category', color = '#ff6600' ) => {
        return await models.Category.create({ UserId, label, color });
    },
    createRandomDigits: ( max, zero_lead = false ) => {
        return randomDigits.generate( max, zero_lead );
    } 
};

module.exports = factory;