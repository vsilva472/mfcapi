'use strict'

const chai          = require( 'chai' );
const expect        = chai.expect;
const jwtConfig     = require( '../../config/jwt' )[ process.env.NODE_ENV || 'development' ];

const models    = require( '../../models' );
const factory   = require( '../helpers/factory.js' );
const databaseHelper   = require( '../helpers/db.js' );

describe( '#UNITY - TOKEN', () => {
    before( databaseHelper.clearTables );
    
    it( 'Refresh Token TTL must be auto set when created', async () => {
        const user = await factory.createUser();
        const Token = await models.Token.create({ UserId: user.id, auth_id: 'Teste' });
        const now = new Date();
        
        expect( Token.expiresAt ).to.be.greaterThan( now );
    });
});