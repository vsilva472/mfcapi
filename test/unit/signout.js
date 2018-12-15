'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect       = chai.expect;

const models    = require( '../../models' );
const factory   = require( '../helpers/factory.js' );
const databaseHelper   = require( '../helpers/db.js' );

describe( '#SIGNOUT', () => {
    before( databaseHelper.clearTables );

    it( 'After logout the associated refresh token with user and sessid should be remove from database', async () => {
        const user1 = await factory.createUser();
        const user2 = await factory.createUser();

        const sessid1 = factory.createRandomDigits( 9999999, true );
        const sessid2 = factory.createRandomDigits( 9999999, true );
        const sessid3 = factory.createRandomDigits( 9999999, true );

        const token = factory.createTokenForUser( user1, null, null, sessid1 );

        await factory.createRefreshTokenForUser( user1, sessid1 );
        await factory.createRefreshTokenForUser( user1, sessid2 );
        await factory.createRefreshTokenForUser( user2, sessid3 )

        const request = await supertest.post( '/auth/signout' ).set( 'Authorization', `Bearer ${token}` ).send();

        const RefreshTokensForUser1 = await models.Token.findAll( { where: { UserId: user1.id } } );
        const RefreshTokensForUser2 = await models.Token.findAll( { where: { UserId: user2.id } } );

        expect( request.statusCode ).to.be.equal( 200 );
        expect( request.type ).to.be.equals( 'application/json' );
        expect( RefreshTokensForUser1 ).to.have.lengthOf( 1 );
        expect( RefreshTokensForUser2 ).to.have.lengthOf( 1 );
    });
});