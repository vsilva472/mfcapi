const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const expect        = require( 'chai' ).expect;

const models        = require( '../models' );
const routeBase     = '/auth/password/reset/';
const routeWithFakeToken =  `${routeBase}mytonken`;

const { name, email, password, password_conf }  = require( './mocks/user' );


describe( "#Password Reset",  () => {
    describe( "#Without access to database",  () => {
        it( '#AUTHENTICATED users CANNOT reset password', done => {
            const credentials = { email };
            
            supertest
                .post( routeWithFakeToken )
                .set( 'Authorization', 'Bearer fake token here' )
                .send( credentials )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done );
        });
    
        it( '#Invalid email is not allowed', done => {       
            supertest
                .post( routeWithFakeToken )
                .send( { email: 'invalid email here' } )
                .expect('Content-Type', /json/)
                .expect( 422 )
                .end( done );
        });
    
        it( '#Password and password_conf cannot be differents', done => {
            const data = { email, password, password_conf: 'Other password' };
    
            supertest
                .post( routeWithFakeToken )
                .send( data )
                .expect('Content-Type', /json/)
                .expect( 422 )
                .end( done );
        });
    
        it( '#Non existing emails inside database, not area allowed', done => {
            const data = { email: 'hinata@konoha.jp', password, password_conf };
    
            supertest
                .post( routeWithFakeToken )
                .send( data )
                .expect( 400 )
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

        it( '#Token Expired is not allowed to reset password', done => {
            // at this test token can be anything
            const credentials = { email, password, password_conf };
    
            const now = new Date();
            now.setHours( now.getHours() + 1 );
    
            models.User.findOne( { where: { email: email } } );
    
            supertest
                .post( '/auth/password/recover' )
                .send( { email: credentials.email })
                .end( async function (err, req ) {
                    // get current user
                    const user = await models.User
                            .findOne({ where: { email: credentials.email } });
    
                    // make a date expired
                    var expired_date = new Date();
                    expired_date = expired_date.getHours() - 10;
    
                    // and update user with expired date
                    user.password_reset_expires = expired_date;
                    await user.save();
    
                    // make a post to test this condition
                    supertest
                        .post( `${routeBase}${user.password_reset_token}` )
                        .send( credentials )
                        .expect('Content-Type', /json/)
                        .expect( 400 )
                        .end( done );
                }
            );
        });
    
        it( '#Password Reset - After Successfull reset, the new password cannot be equals to old password', done => {
            const credentials = { email, password: 'hinata my love', password_conf: 'hinata my love' };
            
            supertest
                .post( '/auth/password/recover' )
                .send( { email: credentials.email })
                .end( async function (err, req ) {
                    // get current user
                    const oldUser = await models.User
                            .findOne( {where: { email: credentials.email }});
    
                    // make a post to test this condition
                    supertest
                        .post( `${routeBase}${oldUser.password_reset_token}` )
                        .send( credentials )
                        .expect('Content-Type', /json/)
                        .expect( 200 )
                        .end( async function ( err, res ) {
                            // old passwor cannot be equals same password
                            const newUser = await models.User
                                .findOne( {where: { email: credentials.email }});
                            
                            expect( newUser.password ).to.not.equals( credentials.password );
                            expect( oldUser.password ).to.not.equals( newUser.password );
    
                            expect( newUser.password_reset_token ).to.equals( null );
                            expect( newUser.password_reset_expires ).to.equals( null );
                            
                            done();
                        });
                }
            );
        });
    });    
});
