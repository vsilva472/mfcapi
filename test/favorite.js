const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const expect        = require( 'chai' ).expect;

const jwt           = require( 'jsonwebtoken' );
const jwtConfig     = require( '../config/jwt' );
const favoriteData  = require( './mocks/favorite' );

let route         = '/users/';
const jwtToken = jwt.sign({ id: 1 }, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );

const { name, email, password } = require( './mocks/user' );
const models = require( '../models' );
let user;
let favorite;

describe( "#User Favorite",  () => {        
    before( async function () {
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        models.sequelize.options.maxConcurrentQueries = 1;
        await models.User.sync({ force: true });
        await models.Favorite.sync({ force: true });
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        user = await models.User.create( { name, email, password } );
        favorite = await models.Favorite.create({ ...favoriteData, UserId: user.id });
        route = `${route}${user.id}/favorites`; 
    });
    
    it( "#Should not return favorites for non authenticated users", done => {
        supertest
            .get( route )
            .expect( 401 )
            .end( done );
    });

    it( "#Should not create a favorite without valid data", done => {
        supertest
            .post( route )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( function ( err, res ) {
                if ( err ) return done( err );

                expect( res.status ).to.be.equal( 422 );
                expect( res.body ).to.have.own.property( 'errors' );
                expect( res.body.errors ).to.be.an( 'array' );
                expect( res.body.errors[0] ).to.have.own.property( 'param' );
                expect( res.body.errors[0].param ).to.be.equal( 'label' );
                expect( res.body.errors[1] ).to.have.own.property( 'param' );
                expect( res.body.errors[1].param ).to.be.equal( 'type' );
                expect( res.body.errors[2] ).to.have.own.property( 'param' );
                expect( res.body.errors[2].param ).to.be.equal( 'value' );
                expect( res.body.errors[3] ).to.have.own.property( 'param' );
                expect( res.body.errors[3].param ).to.be.equal( 'UserId' );
                done();
            });
    });

    it( "#Should return a list of favorites", done => {
        supertest
            .get( route )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .expect( 200 )
            .end( function ( err, res ) {
                if ( err ) return done( err );
                                
                expect( res.status ).to.be.equal( 200 );
                expect( res.body.length ).to.be.equal( 1 );
                done();
            } );
    });

    it( "#Should successfull create favorite ", done => {
        supertest
            .post( route )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .send({ ...favoriteData, UserId: user.id })
            .expect(201)
            .end( done );
    });

    it( "#Should return details of a favorite", done => {
        supertest
            .get( `${route}/${favorite.id}` )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( function ( err, res ) {
                if ( err ) return done( err );

                expect(res.status).to.be.equal(200);

                expect( res.body ).to.has.own.property( 'id' );
                expect( res.body ).to.has.own.property( 'label' );
                expect( res.body ).to.has.own.property( 'type' );
                expect( res.body ).to.has.own.property( 'value' );

                expect( res.body.id ).to.be.equal(favorite.id);
                expect( res.body.label ).to.be.equal(favoriteData.label);
                expect( res.body.type ).to.be.equal(favoriteData.type);
                expect( res.body.value ).to.be.equal( favoriteData.value.toString() );
                expect( res.body.UserId ).to.be.equal( favorite.UserId);
                done();
            });
    });

    it( "#Should update Favorite", done => {
        const paramsToUpdate = { label: "Updated Label", value: 17.99 };
                
        supertest
            .put( `${route}/${favorite.id}` )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .send( paramsToUpdate )
            .end( ( err, res ) => {
                if ( err ) return done( err );

                models.Favorite.findOne({ where: { id: favorite.id } })
                .then( updatedFavorite => {
                    expect( res.status ).to.be.equal( 200 );
                    expect( updatedFavorite.label ).to.be.equal( paramsToUpdate.label );
                    expect( updatedFavorite.value ).to.be.equal( paramsToUpdate.value.toString() );
                    done();
                })
                .catch( err => done( err ) );
            });
    });

    it( "#Should remove a favorite from database", done => {                
        const rt = `${route}/${favorite.id}`;
        
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