const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const expect        = require( 'chai' ).expect;

const User          = require( '../models' ).User;
const route         = '/auth/password/recover';

const { name, email, password, password_conf }  = require( './mocks/user' );


describe( "#Password Recover",  () => {
    beforeEach( async function () {
        await User.sync({force: true});
        await User.create({ name, email, password, password_conf });
    });

    afterEach( async () => {
        await User.destroy({ truncate: true });
    });

    it( '#AUTHENTICATED users CANNOT recover password', done => {
        const credentials = { email };
        
        supertest
            .post( route )
            .set( 'Authorization', 'Bearer fake token here' )
            .send( credentials )
            .expect('Content-Type', /json/)
            .expect( 403 )
            .end( done );
    });

    it( '#Non existing email requests must receive SUCCESS status', done => {
        supertest
            .post( route )
            .send( { email: "hinata@konoha.jp" } )
            .expect('Content-Type', /json/)
            .expect( 200 )
            .end( done );
    });

    it( '#All Real users can recover password', done => {
        supertest
            .post( route )
            .send( { email } )
            .end( function ( err, res ) {
               User.findOne({ where: { email } }).then( user => {
                    expect( res.status ).to.equal(200);
                    expect( user.password_reset_token.length ).to.equal( 4 );
                    expect( typeof user.password_reset_expires ).to.equal( 'object' );
                    done();
                })
                .catch( err => {
                    done( err );
                });
            } );
    });
});