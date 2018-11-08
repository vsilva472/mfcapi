const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const expect        = require( 'chai' ).expect;

const models        = require( '../models' );
const route         = '/auth/password/recover';

const { name, email, password, password_conf }  = require( './mocks/user' );


describe( "#Password Recover",  () => {
    describe( "#Without access to database",  () => {
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
    });

    describe( "#With access to database",  () => {
        beforeEach( async function () {
            await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            models.sequelize.options.maxConcurrentQueries = 1;
            await models.User.sync({ force: true });
            await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            await models.User.create({ name, email, password, password_conf });
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
                   models.User.findOne({ where: { email } }).then( user => {
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
});

