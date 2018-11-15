const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect        = chai.expect;
const assertArrays  = require('chai-arrays');
chai.use(assertArrays);

const models = require( '../models' );
const factory = require( './helpers/factory.js' );

describe( "#User Favorite",  () => {        
    before( async function () {
        await models.Favorite.destroy({ where: {} });
        await models.User.destroy({ where: {} });
    });

    describe( '#LIST', () => {
        it( "#Should NOT list favorites for non authenticated users", done => {
            supertest
                .get( '/users/10000/favorites' )
                .expect( 401 )
                .end( done );
        });

        it( "#Should NOT list favorites from other user", async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();

            const routeForUser2      = `/users/${user2.id}/favorites`;
            const tokenForUser1      = factory.createTokenForUser( user1.id );  
    
            await factory.createFavorite( user1.id );
            await factory.createFavorite( user2.id );
    
            await supertest
                .get( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 );
        });

        it( "#Should list favorites of a user", async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();

            const routeForUser1      = `/users/${user1.id}/favorites`;
            const tokenForUser1      = factory.createTokenForUser( user1.id );  
    
            await factory.createFavorite( user1.id );
            await factory.createFavorite( user2.id );
    
            await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( res => {
                    expect( res.status ).to.be.equals( 200 );
                    expect( res.body ).to.have.lengthOf( 1 );
                    expect( res.body[0] ).to.have.own.property( 'UserId' );
                    expect( res.body[0].UserId ).to.not.be.equal( user2.id );
                });
        });
    });

    describe( '#SHOW', () => {
        it( "#Should NOT return details for non authenticated users", async () => {
            const route = `/users/1/favorites/1`;
            
            await supertest
                .get( route )
                .expect( 401 );
        });

        it( '#Should NOT return details from others users', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const favorite2 = await factory.createFavorite( user2.id );
            const route     = `/users/${user1.id}/favorites/${favorite2.id}`;
            const token     = factory.createTokenForUser( user1.id ); 

            await supertest
                .get( route )
                .set( 'Authorization', `Bearer ${token}` )
                .expect( 403 );
        });

        it( '#Should NOT return details from others users EVEN if :user_id and :favorite_id are correct', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const favorite2 = await factory.createFavorite( user2.id );
            const routeForUser2     = `/users/${user2.id}/favorites/${favorite2.id}`;
            const tokenForUser1     = factory.createTokenForUser( user1.id );

            await supertest
                .get( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 );
        });

        it( "#Should return details of a favorite for his owner", async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const favorite1 = await factory.createFavorite( user1.id );
            const favorite2 = await factory.createFavorite( user2.id );
            
            const routeForUser1     = `/users/${user1.id}/favorites/${favorite1.id}`;
            const tokenForUser1     = factory.createTokenForUser( user1.id );

            await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( res => {
                    expect( res.status ).to.be.equal( 200 );
                    expect( res.body ).to.not.be.array();
                    expect( res.body ).to.have.own.property( 'UserId' );
                    expect( res.body.UserId ).to.be.equal( user1.id );
                });
        });
    });

    describe( "#CREATE", () => {
        it( "#Should NOT create a favorite for non authenticated users", async () => {
            const route = `/users/1/favorites`;
            
            await supertest
                .post( route )
                .expect( 401 );
        });

        it( "#Should NOT create a favorite without valid data", async () => {
            const user  = await factory.createUser();
            const route = `/users/${user.id}/favorites`;
            const token = factory.createTokenForUser( user.id );
            
            await supertest
                .post( route )
                .set( 'Authorization', `Bearer ${token}` )
                .expect( res => {
                    expect( res.status ).to.be.equal( 422 );
                    expect( res.body ).to.have.own.property( 'errors' );
                    expect( res.body.errors ).to.be.an.array();
                    expect( res.body.errors[0] ).to.have.own.property( 'param' );
                    expect( res.body.errors[0].param ).to.be.equal( 'label' );
                    expect( res.body.errors[1] ).to.have.own.property( 'param' );
                    expect( res.body.errors[1].param ).to.be.equal( 'type' );
                    expect( res.body.errors[2] ).to.have.own.property( 'param' );
                    expect( res.body.errors[2].param ).to.be.equal( 'value' );
                });
        });

        it ( "#Should NOT create favorite for others users", async () => {
            const user1  = await factory.createUser();
            const user2  = await factory.createUser();

            const routeForUser2 = `/users/${user2.id}/favorites`;
            const tokenForUser1 = factory.createTokenForUser( user1.id );

            await supertest
                .post( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send({ label: 'Favorite', value: 12.99, type: 1 })
                .expect( 403 );
        });

        it( "#Should create favorite", async () => {
            const user  = await factory.createUser();
            const route = `/users/${user.id}/favorites`;
            const token = factory.createTokenForUser( user.id );

            await supertest
                .post( route )
                .set( 'Authorization', `Bearer ${token}` )
                .send({ label: 'Favorite', value: 12.99, type: 1, UserId: user.id })
                .expect( res => {
                    expect( res.status ).to.be.equal( 201 );
                    expect( res.body ).to.have.own.property( 'data' );
                    expect( res.body.data ).to.have.own.property( 'UserId' );
                    expect( res.body.data.UserId ).to.be.equal( user.id );
                });
        });
    });
   
    describe( "#UPDATE", () => {
        it( "#Should NOT update a favorite if users is unauthenticated", done => {
            const route = `/users/1/favorites/1`;

            supertest
                .put( route )
                .expect( 401 )
                .end( done );
        });

        it( "Should not update favorite from other users", async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const favorite2 = await factory.createFavorite( user2.id );
            const routeForFavorite2     = `/users/${user1.id}/favorites/${favorite2.id}`;
            const tokenForUser1     = factory.createTokenForUser( user1.id );

            await supertest
                .put( routeForFavorite2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( { label: 'Updated Label', type: 0, value: 7.77 } )
                .expect( 403 );
        });

        it( "Should not update favorite from other users EVEN if other user_id is correct", async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const favorite2 = await factory.createFavorite( user2.id );
            const routeForUser2Favorite2     = `/users/${user2.id}/favorites/${favorite2.id}`;
            const tokenForUser1     = factory.createTokenForUser( user1.id );

            await supertest
                .put( routeForUser2Favorite2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( { label: 'Updated Label', type: 0, value: 7.77 } )
                .expect( 403 );
        });

        it( "Should update favorite", async () => {
            const user     = await factory.createUser();
            const favorite = await factory.createFavorite( user.id );
            
            const route     = `/users/${user.id}/favorites/${favorite.id}`;
            const token     = factory.createTokenForUser( user.id );

            await supertest
                .put( route )
                .set( 'Authorization', `Bearer ${token}` )
                .send( { label: 'Updated Label', type: 0, value: 7.77 } )
                .expect( 200 );
        });
    });

    describe( '#DELETE', () => {
        it( '#Should NOT be possible to non authenticated users remove favorites', done => {
            supertest
                .delete( '/users/1/favorites/1' )
                .expect( 401 )
                .end( done );
        });

        it( '#Should no be possible to a user delete favorite of other users', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();
            
            const favoriteOfUser2 = await factory.createFavorite( user2.id );
            const route = `/users/${user1.id}/favorites/${favoriteOfUser2.id}`;
            const tokenForUser1 = factory.createTokenForUser( user1.id );

            await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 ); 
        });

        it( '#Should no be possible to a user delete favorite of other users EVEN if he pass a correct other :user_id and :favorite_id', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();
            
            const favoriteOfUser2 = await factory.createFavorite( user2.id );
            const routeForUser2 = `/users/${user2.id}/favorites/${favoriteOfUser2.id}`;
            const tokenForUser1 = factory.createTokenForUser( user1.id );

            await supertest
                .delete( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 ); 
        });

        it( '#Should remove a user favorite', async () => {
            const user      = await factory.createUser(); 
            const favorite  = await factory.createFavorite( user.id );
            
            const route = `/users/${user.id}/favorites/${favorite.id}`;
            const token = factory.createTokenForUser( user.id );

            await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${token}` )
                .expect( async res => {
                    deletedFavorite = await models.Favorite.findOne({ where: { id: favorite.id } });
                    expect( res.status ).to.be.equal( 200 );
                    expect( deletedFavorite ).to.be.equal( null );
                });
        });
    });
});