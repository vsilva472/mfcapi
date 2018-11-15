const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect       = chai.expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

const models    = require( '../models' );
const factory   = require( './helpers/factory.js' );

const routeBase             = '/auth/password/reset/';
const routeWithFakeToken    = `${routeBase}1234789`;

const passwordRecoverRoute  = '/auth/password/recover';

const routes = {
    signin: '/auth/signin',
    signup: '/auth/signup',
    password: {  recover: '/auth/password/recover',  reset: '/auth/password/reset/' }
};

describe( '#AUTH', () => {
    describe( "#PASSWORD RESET",  () => {
        it( '#A given signed user cannot recover password', done => {
            supertest
                    .post( routeWithFakeToken )
                    .set( 'Authorization', 'Bearer fake token here' )
                    .expect('Content-Type', /json/)
                    .expect( 403 )
                    .end( done );
        });
    
        it( '#A given user cannot reset password with invalid data', done => {
            supertest
                .post( routeWithFakeToken )
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
    
        it( '#A given non registered user cannot recover password', done => {
            supertest
                .post( routeWithFakeToken )
                .send({ email: 'nonexisting@email.com', password: '44444444', password_conf: '44444444' })
                .expect( 400 )
                .end( done );
        });
    
        it( '#A given user cannot reset password with a expired token', async () => {
            const user  = await factory.createUser();
            const now   = new Date();
            now.setHours( now.getHours() - 1 );
    
            user.password_reset_token   = factory.createRandomDigits( 400, true );
            user.password_reset_expires = now;
            await user.save();
            
            await supertest
                .post( `${routeBase}${user.password_reset_token}` )
                .send({ email: user.email, password: 'new pass', password_conf: 'new pass' })
                .expect( 400 );
        });
    });

    describe( '#PASSWORD RECOVER', () => {
        it( "#A given user cannot recover password if he is authenticated", done => {
            supertest
                .post( passwordRecoverRoute )
                .set( 'Authorization', 'Bearer fake token here' )
                .send( { email: 'foo@bar.net' } )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done ); 
        });

        it( '#A given with non registered email must receive 200 as status', done => {
            supertest
                .post( passwordRecoverRoute )
                .send( { email: "foo@bar.net" } )
                .expect('Content-Type', /json/)
                .expect( 200 )
                .end( done );
        });

        it( '#A given user must can recover password', async () => {
            const user = await factory.createUser();

            await supertest
                .post( passwordRecoverRoute )
                .send( { email: user.email } )
                .expect( async res => {
                    const checkUser = await models.User.findOne({ where: { email: user.email } });
                    expect( res.status ).to.equal( 200 );
                    expect( checkUser.password_reset_token.length ).to.equal( 4 );
                    expect( Object.prototype.toString.call( checkUser.password_reset_expires ) ).to.be.equal( '[object Date]' );
                });
        })
    });

    describe( '#SIGNIN', () => {
        it( '#A given authenticated user cannot re-signin', done => {
            supertest
                .post( routes.signin )
                .set( 'Authorization', 'Bearer fake token here' )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done );
        });

        it( '#A given user cannot signin with invalid data', done => {
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

        it( '#A given registered user can sign', async () => {
            const user = await factory.createUser();

            await supertest
                .post( routes.signin )
                .send({ email: user.email, password: '123456' }) // factory default password
                .expect( res => {
                    expect( res.status ).to.be.equal( 200 );
                    expect( res.type ).to.be.equal( 'application/json' );

                    expect( res.body ).to.have.own.property( 'user' );
                    
                    expect( res.body.user ).to.have.own.property( 'email' );
                    expect( res.body.user ).to.have.own.property( 'name' );
    
                    expect( res.body.user ).to.not.have.own.property( 'password' );
                    expect( res.body.user ).to.not.have.own.property( 'createdAt' );
                    expect( res.body.user ).to.not.have.own.property( 'updatedAt' );
                    
                    expect( res.body.user.email ).to.equal( user.email );
                    expect( res.body.user.name ).to.equal( user.name );
    
                    expect( res.body ).to.have.own.property( 'token' );
                    expect( typeof res.body.token ).to.equal( 'string' );
                    expect( res.body.token.length ).to.greaterThan( 0 );
                });
        });
    });

    describe( '#SIGNUP', () => {
        it( '#A given authenticated user cannot signup', done => {
            supertest
                .post( routes.signup )
                .set( 'Authorization', 'Bearer fake_token_here' )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done );
        });

        it( '#A given user cannot signup with invalid data', done => {
            supertest
                .post( routes.signup )
                .set( 'Authorization', 'Bearer fake_token_here' )
                .end( (err, res) => {});
        });
    });
});