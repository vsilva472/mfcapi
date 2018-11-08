const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const expect        = require( 'chai' ).expect;

const models        = require( '../models' );
const route         = '/auth/signin';

const { name, email, password, password_conf }  = require( './mocks/user' );

describe( "#Singin",  () => {
    beforeEach( async function () {
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        models.sequelize.options.maxConcurrentQueries = 1;
        await models.User.sync({ force: true });
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    });

    describe( "#Without access to database",  () => {
        it( '#AUTHENTICATED users cannot signin again', done => {
            const credentials = { email, password };
            
            supertest
                .post( route )
                .set( 'Authorization', 'Bearer fake token here' )
                .send( credentials )
                .expect('Content-Type', /json/)
                .expect( 403 )
                .end( done );
        });

        it( '#Credentials must have a valid email', done => {
            const credentials = { password };
    
            supertest
                .post( route )
                .send( credentials )
                .expect('Content-Type', /json/)
                .expect( 422 )
                .end( done );
        });
    
        it( '#Password must have between 3 and 21 chars', done => {
            const credentials = { email, password: 12 };
    
            supertest
                .post( route )
                .send( credentials )
                .expect('Content-Type', /json/)
                .expect( 422 )
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
    
    
        it( '#After succesfull signin. Response must NOT INCLUDE password AND INCLUDE user name, user email, token', done => {
            const credentials = { email, password };
    
            supertest
                .post( route )
                .send( credentials )
                .end( function ( err, res ) {
                    expect( res.status ).to.equal( 200 );
                    
                    expect( res.body ).to.have.own.property( 'user' );
                    
                    expect( res.body.user ).to.have.own.property( 'email' );
                    expect( res.body.user ).to.have.own.property( 'name' );
    
                    expect( res.body.user ).to.not.have.own.property( 'password' );
                    expect( res.body.user ).to.not.have.own.property( 'createdAt' );
                    expect( res.body.user ).to.not.have.own.property( 'updatedAt' );
                    
                    expect( res.body.user.email ).to.equal( credentials.email );
    
                    expect( res.body ).to.have.own.property( 'token' );
                    expect( typeof res.body.token ).to.equal( 'string' );
                    expect( res.body.token.length ).to.greaterThan( 0 );
                    done();
                });
        });
    });
});