'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect       = chai.expect;
const assertArrays = require('chai-arrays');
const jwt = require( 'jsonwebtoken' );

chai.use(assertArrays);

const models    = require( '../../models' );
const factory   = require( '../helpers/factory.js' );
const databaseHelper   = require( '../helpers/db.js' );
const { secret, ttl, refreshSecret, refreshTTL }  = require( '../../config/jwt' )[ process.env.NODE_ENV || 'development' ];

const routes = {
    signin: '/auth/signin',
    signup: '/auth/signup',
    password: {  
        recover: '/auth/password/recover',  
        reset: ( token = '' )  => {
            return `/auth/password/reset/${token}`;
        }
    },
    token: {
        refresh: '/auth/token/refresh'
    }
};

describe( '#AUTH', () => {
    before( databaseHelper.clearTables );

    describe( "#PASSWORD RESET",  () => {
        it( 'A given signed user cannot recover password', done => {
            supertest
                .post( routes.password.reset('abc') )
                .set( 'Authorization', 'Bearer fake token here' )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done );
        });
    
        it( 'A given user cannot reset password with invalid data', done => {
            supertest
                .post( routes.password.reset('abc') )
                .end( ( err, res ) => {
                    if ( err ) return done( err );
                    expect( res.status ).to.be.equal( 422 );
                    expect( res.type ).to.be.equal( 'application/json' );
                    expect( res.body ).to.have.own.property( 'errors' );
                    expect( res.body.errors ).to.be.an.array();
                    expect( res.body.errors ).to.have.lengthOf( 3 )
                    done();
                });
        });
    
        it( 'A given non registered user cannot recover password', done => {
            supertest
                .post( routes.password.reset('abc') )
                .send({ email: 'nonexisting@email.com', password: '44444444', password_conf: '44444444' })
                .expect( 400 )
                .end( done );
        });
    
        it( 'A given user cannot reset password with a expired token', async () => {
            const user  = await factory.createUser();
            const now   = new Date();
            now.setHours( now.getHours() - 1 );
    
            user.password_reset_token   = factory.createRandomDigits( 400, true );
            user.password_reset_expires = now;
            await user.save();
            
            const response = await supertest
                .post( routes.password.reset( user.password_reset_token ) )
                .send({ email: user.email, password: 'new pass', password_conf: 'new pass' });
            
            expect( response.statusCode ).to.be.equal( 400 );
        });

        it( 'A given registered user can reset your password', async () => {
            const user  = await factory.createUser();
            const now   = new Date();
            now.setHours( now.getHours() + 1 );
    
            user.password_reset_token   = factory.createRandomDigits( 400, true );
            user.password_reset_expires = now;
            await user.save();
            
            const response = await supertest
                .post( routes.password.reset( user.password_reset_token ) )
                .send({ email: user.email, password: 'new pass', password_conf: 'new pass' });

            const checkUser = await models.User.findOne({ where: { id: user.id } });

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( user.password ).to.not.be.equals( checkUser.password );
        });
    });

    describe( '#PASSWORD RECOVER', () => {
        it( "A given user cannot recover password if he is authenticated", done => {
            supertest
                .post( routes.password.recover )
                .set( 'Authorization', 'Bearer fake token here' )
                .send( { email: 'foo@bar.net' } )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done ); 
        });

        it( 'A given with non registered email must receive 200 as status', done => {
            supertest
                .post( routes.password.recover )
                .send( { email: "foo@bar.net" } )
                .expect('Content-Type', /json/)
                .expect( 200 )
                .end( done );
        });

        it( 'A given user must can recover password', async () => {
            const user      = await factory.createUser();
            const response  = await supertest.post( routes.password.recover ).send( { email: user.email } );
            const checkUser = await models.User.findOne({ where: { email: user.email } });
            
            expect( response.status ).to.equal( 200 );
            expect( checkUser.password_reset_token.length ).to.equal( 4 );
            expect( Object.prototype.toString.call( checkUser.password_reset_expires ) ).to.be.equal( '[object Date]' );
        })
    });

    describe( '#SIGNIN', () => {
        it( 'A given authenticated user cannot re-signin', done => {
            supertest
                .post( routes.signin )
                .set( 'Authorization', 'Bearer fake token here' )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done );
        });

        it( 'A given user cannot signin with invalid data', done => {
            supertest
                .post( routes.signin )
                .end( ( err, res ) => {
                    if ( err ) return done( err );
                    
                    expect( res.status ).to.be.equal( 422 );
                    expect( res.type ).to.be.equal( 'application/json' );
                    
                    expect( res.body ).to.have.own.property( 'errors' );
                    expect( res.body.errors ).to.be.an.array();
                    expect( res.body.errors ).to.have.lengthOf( 2 );

                    expect( res.body.errors[0] ).to.have.own.property( 'param' );
                    expect( res.body.errors[0].param ).to.be.equal( 'email' );
                    
                    expect( res.body.errors[1] ).to.have.own.property( 'param' );
                    expect( res.body.errors[1].param ).to.be.equal( 'password' );

                    done();
                });
        });

        it( 'A given registered user can sign', async () => {
            const user      = await factory.createUser();
            const response  =  await supertest.post( routes.signin ).send({ email: user.email, password: '123456' }); // factory default password

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );

            expect( response.body ).to.have.own.property( 'user' );
            
            expect( response.body.user ).to.have.own.property( 'email' );
            expect( response.body.user ).to.have.own.property( 'name' );

            expect( response.body.user ).to.not.have.own.property( 'password' );
            expect( response.body.user ).to.not.have.own.property( 'createdAt' );
            expect( response.body.user ).to.not.have.own.property( 'updatedAt' );
            
            expect( response.body.user.email ).to.equal( user.email );
            expect( response.body.user.name ).to.equal( user.name );

            expect( response.body ).to.have.own.property( 'token' );
            expect( typeof response.body.token ).to.equal( 'string' );
            expect( response.body.token.length ).to.greaterThan( 0 );
        });
    });

    describe( '#SIGNUP', () => {
        it( 'A given authenticated user cannot signup', done => {
            supertest
                .post( routes.signup )
                .set( 'Authorization', 'Bearer fake_token_here' )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done );
        });
        
        it( 'A given user cannot signup with invalid data', done => {
            supertest
                .post( routes.signup )
                .end( (err, res) => {
                    if ( err ) return done( err );
                                        
                    expect( res.status ).to.be.equal( 422 );
                    expect( res.type ).to.be.equal( 'application/json' );

                    expect( res.body.errors ).to.be.an.array();
                    expect( res.body.errors ).to.have.lengthOf( 5 );

                    expect( res.body.errors[0] ).to.have.own.property( 'param' );
                    expect( res.body.errors[0].param ).to.be.equal( 'email' );

                    expect( res.body.errors[1] ).to.have.own.property( 'param' );
                    expect( res.body.errors[1].param ).to.be.equal( 'email' );
                    
                    expect( res.body.errors[2] ).to.have.own.property( 'param' );
                    expect( res.body.errors[2].param ).to.be.equal( 'name' );

                    expect( res.body.errors[3] ).to.have.own.property( 'param' );
                    expect( res.body.errors[3].param ).to.be.equal( 'password' );

                    expect( res.body.errors[4] ).to.have.own.property( 'param' );
                    expect( res.body.errors[4].param ).to.be.equal( 'password_conf' );
                    
                    done();
                });
        });

        it( 'A given registered user cannot signup with same email', async () => {
            const user          = await factory.createUser();
            const newUserData   = {email: user.email, name: 'My name', password: '123456', password_conf: '123456'};
            const response      = await supertest.post( routes.signup ).send( newUserData );

            expect( response.statusCode ).to.be.equal( 422 );
            expect( response.body ).to.have.own.property( 'errors' );
            expect( response.body.errors ).to.be.an.array();
            expect( response.body.errors ).to.have.lengthOf( 1 );
            expect( response.body.errors[0] ).to.have.own.property( 'param' );
            expect( response.body.errors[0].param ).to.be.equal( 'email' );
        });

        it( 'A given unregistered user can signup', async () => {
            const payload   = { name: 'Hinata Uzumaki', email: 'hinata_sama@konoha.jp', password: '123456', password_conf: '123456' };
            const response  = await supertest.post( routes.signup ).send( payload );
            const user      = await models.User.findOne({ where: { email: payload.email } });
            
            expect( response.statusCode ).to.be.equal( 201 );
            expect( user.name ).to.be.equals( payload.name );
            expect( user.email ).to.be.equal( payload.email );
        });
    });

    describe ( '#REFRESH TOKEN', () => {
        it( 'A given unauthenticated user cannot refresh token', done => {
            supertest
                .post( routes.token.refresh )
                .end( ( err, res ) => {
                    if ( err ) done( err );
                    expect(res.status).to.be.equals( 400 )
                    expect( res.type ).to.be.equal( 'application/json' );
                    expect( res.body.code ).to.be.equal( 150 );
                    done();
                });
        });

        it( 'A given user can refresh token', async () => {
            const user = await factory.createUser();
            const sessid = factory.createRandomDigits( 9999999, true );
            const expiredToken = jwt.sign({ id: user.id, role: user.role, sessid}, secret, { expiresIn: -1 } );
            const refresh_token = jwt.sign({ id: user.id, role:user.role, sessid}, refreshSecret, { expiresIn: refreshTTL } );
            const payload = jwt.decode( refresh_token );

            await models.Token.create( {UserId: user.id, sessid, expiresAt: ( payload.exp * 1000 ) } );
    
            const response = await supertest.post( routes.token.refresh )
                .set( 'Authorization', `Bearer ${expiredToken}` )
                .send({ refresh_token: refresh_token });
            
            const decoded = jwt.decode( response.body.token );
            // jwt return expiration in seconds
            // so need to convert to milliseconds to compare with now
            const tokenExpiration = decoded.exp * 1000; // converted to milliseconds
            const now = new Date().getTime(); // return milliseconds

            expect( response.status ).to.be.equals( 200 )
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'token' );
            expect( response.body.token ).to.have.length.greaterThan( 10 );
            expect( expiredToken ).to.not.be.equal( response.body.token );
            expect( now ).to.be.lessThan( tokenExpiration );
        });

        it( 'A user cannot refresh token if refresh token is not whitelisted on database', async () => {
            const user = await factory.createUser();
            const sessid = factory.createRandomDigits( 999999, true );
            const expiredToken = factory.createTokenForUser( user, null, -1, sessid );
            const validRefreshToken = factory.createTokenForUser( user, refreshSecret, refreshTTL, sessid );

            const request =  await supertest.post( routes.token.refresh ).set( 'Authorization', `Bearer ${expiredToken}` )
            .send({ refresh_token: validRefreshToken });
            
            expect( request.statusCode ).to.be.equals( 401 )
            expect( request.type ).to.be.equal( 'application/json' );
            expect( request.body ).to.have.own.property( 'code' );
            expect( request.body.code ).to.be.equals( 159 );
            expect( request.body ).to.not.have.own.property( 'token' );
        });
    });

    describe( '#SIGNOUT', () => {
        it( 'A given unauthenticated user cannot sign out', async () => {
            const request = await supertest.post( '/auth/signout' ).send();

            expect( request.statusCode ).to.be.equals( 401 );
            expect( request.type ).to.be.equals( 'application/json' );
        });

        it( 'A given authenticated user can sign out', async () => {
            const user1   = await factory.createUser();
            const sessid  = factory.createRandomDigits( 9999999, true );
            const token   = factory.createTokenForUser( user1, null, null, sessid );

            await factory.createRefreshTokenForUser( user1, sessid );
            
            const request = await supertest.post( '/auth/signout' ).set( 'Authorization', `Bearer ${token}` ).send();

            expect( request.statusCode ).to.be.equal( 200 );
            expect( request.type ).to.be.equals( 'application/json' );
        });
    });
});