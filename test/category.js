const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const expect        = require( 'chai' ).expect;

const jwt           = require( 'jsonwebtoken' );
const jwtConfig     = require( '../config/jwt' );
const categoryData  = require( './mocks/category' );

let route         = '/users/';
const jwtToken = jwt.sign({ id: 1 }, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );

const { name, email, password } = require( './mocks/user' );
const models = require( '../models' );
let user;

describe( "#User Category",  () => {        
    before( async function () {
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        models.sequelize.options.maxConcurrentQueries = 1;
        await models.User.sync({ force: true });
        await models.Category.sync({ force: true });
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        user = await models.User.create( { name, email, password } );
        route = `${route}${user.id}/categories`;
        category = await models.Category.create({ ...categoryData, UserId: user.id });
    });
    
    it( "#Should not return categories for non authenticated users", done => {
        supertest
            .get( route )
            .expect( 401 )
            .end( done );
    });

    it( "#Should not create a category without label and valid color hexacode", done => {
        supertest
            .post( route )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .expect( 422 )
            .end( function ( err, res ) {
                if ( err ) return done( err );

                expect( res.status ).to.be.equal( 422 );
                expect( res.body ).to.have.own.property( 'errors' );
                expect( res.body.errors ).to.be.an( 'array' );
                expect( res.body.errors[0] ).to.have.own.property( 'param' );
                expect( res.body.errors[0].param ).to.be.equal( 'label' );
                expect( res.body.errors[1] ).to.have.own.property( 'param' );
                expect( res.body.errors[1].param ).to.be.equal( 'color' );
                done();
            });
    });

    it( "#Should return a list with one category", done => {
        supertest
            .get( `${route}/${category.id}` )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( function ( err, res ) {
                if ( err ) done( err );
                expect( res.body ).to.has.own.property( 'id' );
                expect( res.body ).to.has.own.property( 'label' );
                expect( res.body ).to.has.own.property( 'color' );

                expect( res.body.id ).to.equal(1);
                expect( res.body.label ).to.equal(categoryData.label);
                expect( res.body.color ).to.equal(categoryData.color);
                done();
            });
    });

    it( "#Should create a category", done => {
        supertest
            .post( route )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .send( { label: categoryData.label, color: categoryData.color  } )
            .end( function ( err, res ) {
                if ( err ) return done( err );
                expect( res.status ).to.equal(201);
                expect( res.body ).to.have.own.property( 'data' );
                expect( res.body.data ).to.have.own.property( 'id' );
                expect( res.body.data.id ).to.equal( 2 );
                expect( res.body.data ).to.have.own.property( 'label' );
                expect( res.body.data.label ).to.equal( categoryData.label );
                expect( res.body.data ).to.have.own.property( 'color' );
                expect( res.body.data.color ).to.equal( categoryData.color );
                done();
            });
    });

    it( "#Should update a category", done => {
        const paramsToUpdate = { label: "Updated Label", color: "#e4e4e4" };
                
        supertest
            .put( `${route}/${category.id}` )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .send( paramsToUpdate )
            .expect( 200 )
            .end( done );
    });

    it( "#Should remove a category from database", done => {                
        const rt = `${route}/${category.id}`;
        
        supertest
            .delete( rt )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( function ( err, res ) {
                if ( err ) return done( err );
                
                    supertest
                        .get( rt )
                        .set( 'Authorization', `Bearer ${jwtToken}` )
                        .end( function ( err, res ) {
                            if ( err ) return done( err );
                            expect( res.status ).to.be.equal( 200 );
                            expect( res.body ).to.be.equal( null );
                            done();
                        } );
            } );
    });
});