const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect        = chai.expect;
const assertArrays  = require('chai-arrays');
chai.use(assertArrays);

const models = require( '../models' );
const factory = require( './helpers/factory.js' );

describe( '#USER FAVORITES',  () => {        
    before( async function () {
        await models.Favorite.destroy({ where: {} });
        await models.User.destroy({ where: {} });
    });

    describe( '#LIST', () => {
        it( '#Anonymous users cannot list favorites', done => {
            supertest
                .get( '/users/10000/favorites' )
                .expect( 401 )
                .end( done );
        });

        it( '#A given user cannot list favorites from other users', async () => {
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

        it( '#A given user can list your own favorites', async () => {
            const user1      = await factory.createUser();

            const routeForUser1      = `/users/${user1.id}/favorites`;
            const tokenForUser1      = factory.createTokenForUser( user1.id );  
    
            await factory.createFavorite( user1.id );
    
            await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( res => {
                    expect( res.status ).to.be.equals( 200 );
                    expect( res.body ).to.have.lengthOf( 1 );
                    expect( res.body[0] ).to.have.own.property( 'UserId' );
                    expect( res.body[0].UserId ).to.be.equal( user1.id );
                });
        });

        it( '#Admins can list favorites of any user', async () => {
            const user1      = await factory.createUser();
            const admin      = await factory.createUser( null, 'admin' );

            const routeForUser1      = `/users/${user1.id}/favorites`;
            const tokenForAdmin      = factory.createTokenForUser( admin.id, 'admin' );  
    
            await factory.createFavorite( user1.id );
            await factory.createFavorite( user1.id );
    
            await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` )
                .expect( res => {
                    expect( res.status ).to.be.equals( 200 );
                    expect( res.body ).to.have.lengthOf( 2 );

                    expect( res.body[0] ).to.have.own.property( 'UserId' );
                    expect( res.body[0].UserId ).to.be.equal( user1.id );

                    expect( res.body[1] ).to.have.own.property( 'UserId' );
                    expect( res.body[1].UserId ).to.be.equal( user1.id );
                });
        });
    });

    describe( '#SHOW', () => {
        it( '#Anonymous users cannot see a favorite details', async () => {
            const route = `/users/1/favorites/1`;
            
            await supertest
                .get( route )
                .expect( 401 );
        });

        it( '#A given user cannot see a favorite of others users', async () => {
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

        it( '#A given user cannot see a favorite of others users EVEN if :user_id and :favorite_id are correct', async () => {
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

        it( '#A given user can see your own favorite', async () => {
            const user1     = await factory.createUser();
            const favorite1 = await factory.createFavorite( user1.id );
           
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

        it( '#Admins can see favorites of any user', async () => {
            const user1     = await factory.createUser();
            const admin     = await factory.createUser(null, 'admin');
            const favorite1 = await factory.createFavorite( user1.id );
           
            const routeForUser1     = `/users/${user1.id}/favorites/${favorite1.id}`;
            const tokenForAdmin     = factory.createTokenForUser( admin.id, 'admin' );

            await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` )
                .expect( res => {
                    expect( res.status ).to.be.equal( 200 );
                    expect( res.body ).to.not.be.array();
                    expect( res.body ).to.have.own.property( 'UserId' );
                    expect( res.body.UserId ).to.be.equal( user1.id );
                });
        });
    });

    describe( "#CREATE", () => {
        it( '#Anonymous users cannot create favorites', async () => {
            const route = `/users/1/favorites`;
            
            await supertest
                .post( route )
                .expect( 401 );
        });

        it( '#A given user cannot create a favorite with invalid data', async () => {
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

        it ( '#A given user cannot create favorites for others users', async () => {
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

        it( '#A given user can create your own favorites', async () => {
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

        it( '#Admins can create favorites for any user', async () => {
            const user   = await factory.createUser();
            const admin  = await factory.createUser( null, 'admin' );

            const route = `/users/${user.id}/favorites`;
            const token = factory.createTokenForUser( admin.id, 'admin' );

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
        it( '#Anonymous users cannot update favorites', done => {
            const route = `/users/1/favorites/1`;

            supertest
                .put( route )
                .expect( 401 )
                .end( done );
        });

        it( '#A given user cannot update a favorite of others users', async () => {
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

        it( '#A given user cannot update a favorite of others users EVEN if other :user_id and :favorite_id are corrects', async () => {
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

        it( '#A given user can update your own favorite', async () => {
            const user     = await factory.createUser();
            const favorite = await factory.createFavorite( user.id );
            
            const route     = `/users/${user.id}/favorites/${favorite.id}`;
            const token     = factory.createTokenForUser( user.id );

            await supertest
                .put( route )
                .set( 'Authorization', `Bearer ${token}` )
                .send( { label: 'Updated Label', type: 0, value: 7.77 } )
                .expect( async res => {
                    const updatedFavorite = await models.Favorite.findOne({ where: { id: favorite.id } });

                    expect( res.status ).to.be.equal( 200 );
                    expect( updatedFavorite.label ).to.be.equal( 'Updated Label' );
                    expect( updatedFavorite.type ).to.be.equal( 0 );
                    expect( updatedFavorite.value ).to.be.equal( '7.77' );
                });
        });


        it( '#Admins can update favorites from other users', async () => {
            const user     = await factory.createUser();
            const admin    = await factory.createUser( null, 'admin' );
            const favorite = await factory.createFavorite( user.id );
            
            const route     = `/users/${user.id}/favorites/${favorite.id}`;
            const token     = factory.createTokenForUser( admin.id, 'admin' );

            await supertest
                .put( route )
                .set( 'Authorization', `Bearer ${token}` )
                .send( { label: 'Updated Label', type: 0, value: 7.77 } )
                .expect( async res => {
                    const updatedFavorite = await models.Favorite.findOne({ where: { id: favorite.id } });

                    expect( res.status ).to.be.equal( 200 );
                    expect( updatedFavorite.label ).to.be.equal( 'Updated Label' );
                    expect( updatedFavorite.type ).to.be.equal( 0 );
                    expect( updatedFavorite.value ).to.be.equal( '7.77' );
                });
        });
    });

    describe( '#DELETE', () => {
        it( '#Anonymous users cannot delete a favorite', done => {
            supertest
                .delete( '/users/1/favorites/1' )
                .expect( 401 )
                .end( done );
        });

        it( '#A given user cannot delete favorites of others users', async () => {
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

        it( '#A given user cannot update favorites of others users EVEN if :user_id and :favorite_id are corrects', async () => {
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

        it( '#A given user can delete your own favorites', async () => {
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

        it( '#Admins can delete favorites from any user', async () => {
            const user      = await factory.createUser(); 
            const admin     = await factory.createUser( null, 'admin' ); 
            const favorite  = await factory.createFavorite( user.id );
            
            const route = `/users/${user.id}/favorites/${favorite.id}`;
            const token = factory.createTokenForUser( admin.id, 'admin' );
    
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