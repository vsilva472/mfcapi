'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const jwt           = require( 'jsonwebtoken' );
const expect        = chai.expect;

const models    = require( '../../models' );
const factory   = require( '../helpers/factory.js' );
const { secret }        = require( '../../config/jwt' )[ process.env.NODE_ENV || 'development' ];
const databaseHelper    = require( '../helpers/db.js' );


describe( '#REFRESH TOKEN', () => {
    before( databaseHelper.clearTables );

    it( 'Refresh Token TTL must be auto set when created', async () => {
        const user = await factory.createUser();
        const Token = await models.Token.create({ UserId: user.id, sessid: '999999' });
        const now = new Date();
        
        expect( Token.expiresAt ).to.be.greaterThan( now );
    });

    it( 'Refresh Token should be created on login', async () => {
        const user = await factory.createUser();
        const credentials = { email: user.email, password: '123456' };

        await supertest
            .post( '/auth/signin' )
            .send( credentials )
            .expect( res => {
                expect( res.status ).to.be.equal( 200 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'token' );
                expect( res.body.token ).to.have.length.greaterThan( 20 );
                expect( res.body ).to.have.own.property( 'refresh_token' );
                expect( res.body.refresh_token ).to.have.length.greaterThan( 20 );
            });
    });

    it( 'Refresh Token sessid should be attached to JWT Token payload', async () => {
        const user = await factory.createUser();
        const credentials = { email: user.email, password: '123456' };

        await supertest
        .post( '/auth/signin' )
        .send( credentials )
        .expect( res => {
            const token = res.body.token;

            jwt.verify( token, secret, ( err, decoded ) => {
                if ( err )  throw err;
        
                expect( res.status ).to.be.equal( 200 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( res.body ).to.have.own.property( 'token' );
                expect( decoded ).to.have.own.property( 'sessid' );
                expect( decoded.sessid ).to.not.be.equal(null);
                expect( decoded.sessid ).to.have.lengthOf( 7 );
            });
        });
    });

    it( 'Refresh Token sessid should be stored in database for later check', done => {
        factory.createUser().then( user => {
            supertest
                .post( '/auth/signin' )
                .send( { email: user.email, password: '123456' } )
                .end( ( err, res ) => {
                    if ( err ) done(err);

                    models.Token.findOne( { where: { UserId: user.id } } ).then( token => {
                        expect( res.status ).to.be.equal( 200 );
                        expect( res.type ).to.be.equal( 'application/json' );
                        expect( token ).to.not.be.equals( null );
                        expect( token.sessid ).to.have.lengthOf( 7 );
                        done();
                    })
                    .catch( err => {
                        done(err);
                    });
            });
        }).catch( err => done( err ) );
    });
});