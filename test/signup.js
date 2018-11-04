const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const expect        = require( 'chai' ).expect;

const User          = require( '../models' ).User;
const route         = '/auth/signup';

const { name, email, password, password_conf }  = require( './mocks/user' );

describe( "#Signup - Steps to validate a user signup",  () => {
    beforeEach( async function () {
        await User.sync();
    });

    afterEach(async () => {
        await User.destroy({ truncate: true });
    });

    it( '#AUTHENTICATED USERS cannot signup' , done => {
        supertest
            .post( route )
            .set( 'Authorization', 'Bearer fake_token_here' )
            .send( { name: 'Yo', password, password_conf } )
            .expect('Content-Type', /json/)
            .expect( 403 )
            .end( done );
    });

    it( '#Name must have between 3 and 21 chars', done => {
        supertest
            .post( route )
            .send( { name: 'Yo', password, password_conf } )
            .expect('Content-Type', /json/)
            .expect( 422 )
            .end( done );
    });

    it( '#Users Cannot signup without a valid email', done => {
        supertest
            .post( route )
            .send( { name, password, password_conf } )
            .expect('Content-Type', /json/)
            .expect( 422 )
            .end( done );
    });

    it( '#Email must be unique inside database', done => {        
        supertest
            .post( route )
            .send( { name, email, password, password_conf } )
            .end( function ( err, res ) {
                supertest
                    .post( route )
                    .send( { name, email, password, password_conf } )
                    .expect( 422 )
                    .end( done );
            });
    });

    it( '#Password can have between 3 and 20 characters', done => {
        supertest
            .post( route )
            .send( { name, email } )
            .expect('Content-Type', /json/)
            .expect( 422 )
            .end( done );
    });

    it( '#Password and Password_conf cannot be different', done => {
        supertest
            .post( route )
            .send( { name, email, password, password_conf: 'other password' } )
            .expect('Content-Type', /json/)
            .expect( 422 )
            .end( done );
    });

    it( '#Only users with valid data can be successfull signup', done => {
        supertest
            .post( route )
            .send( { name, email, password, password_conf } )
            .expect('Content-Type', /json/)
            .expect( 201 )
            .end( done );
    });
});