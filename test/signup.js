const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );

const expect = require( 'chai' ).expect;

const models          = require( '../models' );
const route         = '/auth/signup';

const { name, email, password, password_conf }  = require( './mocks/user' );

describe( "#Signup",  () => {
    describe( "#Without access to database",  () => {
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
    });

    describe( "#With Access to database",  () => {
        beforeEach( async function () {
            await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            models.sequelize.options.maxConcurrentQueries = 1;
            await models.User.sync({ force: true });
            await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
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
    
        it( '#Only users with valid data can be successfull signup', done => {
            supertest
                .post( route )
                .send( { name, email, password, password_conf } )
                .expect('Content-Type', /json/)
                .expect( 201 )
                .end( done );
        });

        it( "#Should signup with 'user' as default role even if try to inject role as admin", done => {
            supertest
                .post( route )
                .send( { name, email, password, password_conf, role: 'admin' } )
                .end( ( err, res ) => {
                    if ( err ) return done(err);

                    models.User.findOne({ where: { email: email } })
                    .then( user => {
                        expect( res.status ).to.be.equal( 201 );
                        expect( user.id ).to.be.equal( 1 );
                        expect( user.email ).to.be.equal( email );
                        expect( user.role ).to.be.equal( 'user' );
                        done();
                    })
                    .catch( err => done( err ) );
                });
        });
    });    
});