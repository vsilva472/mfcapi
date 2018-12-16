'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const jwt           = require( 'jsonwebtoken' );
const expect        = chai.expect;

const models    = require( '../../models' );
const factory   = require( '../helpers/factory.js' );
const { secret, refreshSecret, refreshTTL }  = require( '../../config/jwt' )[ process.env.NODE_ENV || 'development' ];
const databaseHelper    = require( '../helpers/db.js' );


describe( '#REFRESH TOKEN', () => {
    before( databaseHelper.clearTables );

    it( 'Refresh Token should be created on login', async () => {
        const user          = await factory.createUser();
        const credentials   = { email: user.email, password: '123456' };
        const response      = await supertest.post( '/auth/signin' ).send( credentials )

        expect( response.status ).to.be.equal( 200 );
        expect( response.type ).to.be.equal( 'application/json' );
        expect( response.body ).to.have.own.property( 'token' );
        expect( response.body.token ).to.have.length.greaterThan( 20 );
        expect( response.body ).to.have.own.property( 'refresh_token' );
        expect( response.body.refresh_token ).to.have.length.greaterThan( 20 );
    });

    it( 'Refresh Token sessid should be attached to JWT Token payload', async () => {
        const user          = await factory.createUser();
        const credentials   = { email: user.email, password: '123456' };
        const response      = await supertest.post( '/auth/signin' ).send( credentials );
        const token         = response.body.token;
        const decoded       = jwt.verify( token, secret );

        expect( response.status ).to.be.equal( 200 );
        expect( response.type ).to.be.equal( 'application/json' );
        expect( response.body ).to.have.own.property( 'token' );
        expect( decoded ).to.have.own.property( 'sessid' );
        expect( decoded.sessid ).to.not.be.equal(null);
        expect( decoded.sessid ).to.have.lengthOf( 7 );
});

    it( 'Refresh Token sessid should be stored in database for later check', async ()  => {
        const user      = await factory.createUser();
        const response  = await supertest.post( '/auth/signin' ).send( { email: user.email, password: '123456' } );
        const token     = await models.Token.findOne( { where: { UserId: user.id } } );
        
        expect( response.statusCode ).to.be.equal( 200 );
        expect( response.type ).to.be.equal( 'application/json' );
        expect( token ).to.not.be.equals( null );
        expect( token.sessid ).to.have.lengthOf( 7 );            
    });

    it( 'Refresh Token should not accept invalid token', done => {
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', 'SomeTest' )
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 400 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 151 );
                done();
            });
    });

    it( 'Refresh Token should not accept Invalid Bearer type', done => {
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', 'Bearersd sdd' ) // invalid token type
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 400 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 152 );
                done();
            });
    });

    it( 'Refresh Token should not accept bad Bearer value', done => {
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', 'Bearer invalid' ) // invalid token value
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 400 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 153 );
                done();
            });
    });

    it( 'Refresh Token should not accept invalid tokens', done => {
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', 'Bearer TokenLengthOKButThisIsAnInvalidTokenValue' ) // invalid token value
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 400 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 154 );
                done();
            });
    });

    it( 'Refresh Token should return same token if token is not expired', done => {
        const token = factory.createTokenForUser({id: 5, role: 'blbla'});
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', `Bearer ${token}` )
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 200 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'token' );
                expect( res.body.token ).to.be.equals( token );
                done();
            });
    });

    it( 'A Token should not be refreshed if refresh token is not send', done => {
        const token = factory.createTokenForUser({id: 5, role: 'blbla'}, null, -1); // expired token
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', `Bearer ${token}` ) 
            .send( {} )
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 400 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 155 );
                done();
            });
    });

    it( 'A Token should not be refreshed if refresh token is invalid', done => {
        const token = factory.createTokenForUser({id: 5, role: 'blbla'}, null, -1); // expired token
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', `Bearer ${token}` ) 
            .send( { refresh_token: 'invalid' } )
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 400 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 155 );
                done();
            });
    });

    it( 'A Token should not be refreshed if refresh token is expired', done => {
        const token = factory.createTokenForUser({id: 5, role: 'blbla'}, null, -1); // expired token
        const refreshToken = factory.createTokenForUser({id: 5, role: 'blbla'}, refreshSecret, -1); // expired token
        
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', `Bearer ${token}` ) 
            .send( { refresh_token: refreshToken } )
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 401 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 156 );
                done();
            });
    });

    it( 'A Token should not contain data from other user', done => {
        const token = factory.createTokenForUser({id: 1, role: 'abc'}, null, -1); // expired token
        const refreshToken = factory.createTokenForUser({id: 5, role: 'blbla'}, refreshSecret, refreshTTL); // expired token
        
        supertest
            .post( '/auth/token/refresh' )
            .set( 'Authorization', `Bearer ${token}` ) 
            .send( { refresh_token: refreshToken } )
            .end( ( err, res ) => {
                if ( err ) return done( err );
                expect( res.status ).to.be.equals( 403 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'code' );
                expect( res.body.code ).to.be.equals( 158 );
                done();
            });
    });
});