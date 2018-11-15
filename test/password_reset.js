const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect       = chai.expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

const models    = require( '../models' );
const factory   = require( './helpers/factory.js' );
const routeBase     = '/auth/password/reset/';
const routeWithFakeToken = `${routeBase}1234789`;


describe( "#Password Reset",  () => {
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
