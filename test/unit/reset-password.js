'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect        = chai.expect;

const models    = require( '../../models' );
const factory   = require( '../helpers/factory.js' );
const databaseHelper   = require( '../helpers/db.js' );

describe( '#RESET PASSWORD', () => {
    before( databaseHelper.clearTables );

    it( 'For security reason after reset password all refresh tokens should be deleted', async function () {
        const user1  = await factory.createUser();       
        const user2 = await factory.createUser();

        const now   = new Date();
        now.setHours( now.getHours() + 1 );

        user1.password_reset_token   = factory.createRandomDigits( 400, true );
        user1.password_reset_expires = now;
        await user1.save();

        await factory.createRefreshTokenForUser( user1 );
        await factory.createRefreshTokenForUser( user1 );
        await factory.createRefreshTokenForUser( user2 );
        
        const request = await supertest
            .post( `/auth/password/reset/${user1.password_reset_token}` )
            .send({ email: user1.email, password: 'new pass', password_conf: 'new pass' });

        const User1RefreshTokens = await models.Token.findAll ({ where: { UserId: user1.id } } );
        const User2RefreshTokens = await models.Token.findAll ({ where: { UserId: user2.id } } );

        expect( request.statusCode ).to.equal( 200 );
        expect( User1RefreshTokens ).to.have.lengthOf( 0 );
        expect( User2RefreshTokens ).to.have.lengthOf( 1 );
    });
});