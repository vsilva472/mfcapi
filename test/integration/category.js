'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect        = chai.expect;
const assertArrays  = require('chai-arrays');
chai.use(assertArrays);

const models = require( '../../models' );

const factory           = require( '../helpers/factory.js' );
const databaseHelper    = require( '../helpers/db.js' );

describe( "#USER CATEGORIES",  () => { 
    before( databaseHelper.clearTables );
    
    describe( "#LIST", () => {
        it( 'Anonymous users cannot list categories', async () => {
            await supertest
                .get( '/users/1/categories' )
                .expect( 401 );
        });

        it( 'A given user cannot list categories of other user', async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();

            const routeForUser2      = `/users/${user2.id}/categories`;
            const tokenForUser1      = factory.createTokenForUser( user1 );  
    
            await factory.createCategory( user1.id );
            await factory.createCategory( user2.id );
    
            await supertest
                .get( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 );
        });

        it( 'A given user can list your own categories', async () => {
            const user1      = await factory.createUser();

            const routeForUser1      = `/users/${user1.id}/categories`;
            const tokenForUser1      = factory.createTokenForUser( user1 );  
    
            await factory.createCategory( user1.id );
    
            const response = await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            expect( response.statusCode ).to.be.equals( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.lengthOf( 1 );
            expect( response.body[0] ).to.have.own.property( 'UserId' );
            expect( response.body[0].UserId ).to.be.equal( user1.id );
        });

        it( 'Admins can list categories of any user', async () => {
            const user1      = await factory.createUser();
            const admin      = await factory.createUser( null, 'admin' );

            const routeForUser1      = `/users/${user1.id}/categories`;
            const tokenForAdmin      = factory.createTokenForUser( admin );  
    
            await factory.createCategory( user1.id );
            await factory.createCategory( user1.id );
    
            const response = await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` );

            expect( response.statusCode ).to.be.equals( 200 );
            expect( response.type ).to.be.equals( 'application/json' );
            expect( response.body ).to.have.lengthOf( 2 );

            expect( response.body[0] ).to.have.own.property( 'UserId' );
            expect( response.body[0].UserId ).to.be.equal( user1.id );
            
            expect( response.body[1] ).to.have.own.property( 'UserId' );
            expect( response.body[1].UserId ).to.be.equal( user1.id );
        });
    });

    describe( '#SHOW', () => {
        it( 'Anonymous users cannot a see a category of other user', async () => {
            await supertest
                .get( '/users/1/categories/1' )
                .expect( 401 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot see a category other user', async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();

            const cateogyForUser2 = await factory.createCategory( user2.id );

            const routeForUser2      = `/users/${user1.id}/categories/${cateogyForUser2.id}`;
            const tokenForUser1      = factory.createTokenForUser( user1 );  
    
            await supertest
                .get( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot see a category other user even if :user_id and :category_id are correct', async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();

            const cateogyForUser2 = await factory.createCategory( user2.id );

            const routeForUser2      = `/users/${user2.id}/categories/${cateogyForUser2.id}`;
            const tokenForUser1      = factory.createTokenForUser( user1 );  
    
            await supertest
                .get( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user see your own category', async () => {
            const user1      = await factory.createUser();

            const cateogyForUser1 = await factory.createCategory( user1.id );

            const routeForUser1      = `/users/${user1.id}/categories/${cateogyForUser1.id}`;
            const tokenForUser1      = factory.createTokenForUser( user1 );  
    
            const response = await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'UserId' );
            expect( response.body.UserId ).to.be.equal( user1.id );
        });

        it( 'Admins can see details of a category of any user', async () => {
            const user1      = await factory.createUser();
            const admin      = await factory.createUser( null, 'admin' );

            const cateogyForUser1 = await factory.createCategory( user1.id );

            const routeForUser1      = `/users/${user1.id}/categories/${cateogyForUser1.id}`;
            const tokenForAdmin      = factory.createTokenForUser( admin );  
    
            const response = await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` );

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'UserId' );
            expect( response.body.UserId ).to.be.equal( user1.id );
        });
    });

    describe( '#CREATE', () => {
        it( 'Anonymous users cannot create categories', async () => {
            await supertest
                .post( '/users/1/categories' )
                .expect( 401 );
        });

        it( 'A given user cannot create a category for other user', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();

            const tokenForUser1 = factory.createTokenForUser( user1 );
            const routeForUser2 = `/users/${user2.id}/categories`;
            
            await supertest
                .post( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot create a category with invalid data', async () => {
            const user1 = await factory.createUser();

            const tokenForUser1 = factory.createTokenForUser( user1 );
            const routeForUser1 = `/users/${user1.id}/categories`;
            
            const response = await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            expect( response.statusCode ).to.be.equal( 422 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'errors' );
            expect( response.body.errors ).to.be.an.array();
            expect( response.body.errors ).to.have.lengthOf( 2 );
            expect( response.body.errors[0] ).to.have.own.property( 'param' );
            expect( response.body.errors[0].param ).to.be.equal( 'label' );
            expect( response.body.errors[1] ).to.have.own.property( 'param' );
            expect( response.body.errors[1].param ).to.be.equal( 'color' );
        });

        it( 'A given user can create your own category', async () => {
            const user1 = await factory.createUser();

            const tokenForUser1 = factory.createTokenForUser( user1 );
            const routeForUser1 = `/users/${user1.id}/categories`;
            
            const categoryData = { label: 'My Category', color: '#ff6600' };

            const response = await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( categoryData );

            expect( response.statusCode ).to.be.equal( 201 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'data' );
            expect( response.body.data.id ).to.not.be.equal( undefined );
            expect( response.body.data.label ).to.be.equal( categoryData.label );
            expect( response.body.data.color ).to.be.equal( categoryData.color );
        });

        
        it( 'Admins can create a category for any user', async () => {
            const user1 = await factory.createUser();
            const admin = await factory.createUser( null, 'admin' );

            const tokenForAdmin = factory.createTokenForUser( admin );
            const routeForUser1 = `/users/${user1.id}/categories`;
            
            const categoryData = { label: 'My Category', color: '#ff6600' };

            const response = await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` )
                .send( categoryData );

            expect( response.statusCode ).to.be.equal( 201 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'data' );
            expect( response.body.data.id ).to.not.be.equal( undefined );
            expect( response.body.data.label ).to.be.equal( categoryData.label );
            expect( response.body.data.color ).to.be.equal( categoryData.color );
        });

    });

    describe( "#UPDATE", () => {
        it( 'Anonymous users cannot update a category', async () => {
            const route = `/users/1/categories/1`;

            await supertest
                .put( route )
                .expect( 401 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot update a category of other user', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const category2 = await factory.createCategory( user2.id );
            
            const routeForCategory2     = `/users/${user1.id}/categories/${category2.id}`;
            const tokenForUser1         = factory.createTokenForUser( user1 );

            await supertest
                .put( routeForCategory2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( { label: 'Updated Label', color: "#666666" } )
                .expect( 403 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot update a category of other user even if :user_id and :category_id are ok', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const category2 = await factory.createCategory( user2.id );
            
            const routeForUser2     = `/users/${user2.id}/categories/${category2.id}`;
            const tokenForUser1     = factory.createTokenForUser( user1 );

            await supertest
                .put( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( { label: 'Updated Label', color: "#666666" } )
                .expect( 403 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user can update your own category', async () => {
            const user     = await factory.createUser();
            const category = await factory.createCategory( user.id );
            
            const route     = `/users/${user.id}/categories/${category.id}`;
            const token     = factory.createTokenForUser( user );

            const categoryData = { label: 'Updated Category', color: '#e4e4e4' };

            const response = await supertest
                .put( route )
                .set( 'Authorization', `Bearer ${token}` )
                .send( categoryData );

            const updatedCategory = await models.Category.findOne({ where: { id: category.id } });
            
            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( updatedCategory.label ).to.be.equal( categoryData.label );
            expect( updatedCategory.color ).to.be.equal( categoryData.color );
                
        });

        it( 'Admins can update categories of any user', async () => {
            const user     = await factory.createUser();
            const admin    = await factory.createUser( null, 'admin' );
            
            const token     = factory.createTokenForUser( admin );
            const category  = await factory.createCategory( user.id );
            
            const route     = `/users/${user.id}/categories/${category.id}`;

            const categoryData = { label: 'Updated Category 2', color: '#000000' };

            const response = await supertest
                .put( route )
                .set( 'Authorization', `Bearer ${token}` )
                .send( categoryData );

            const updatedCategory = await models.Category.findOne({ where: { id: category.id } });
                
            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( updatedCategory.label ).to.be.equal( categoryData.label );
            expect( updatedCategory.color ).to.be.equal( categoryData.color );

        });
    });

    describe( '#DELETE', () => {
        it( 'Anonymous users cannot delete a category', async () => {
            await supertest
                .delete( '/users/1/categories/1' )
                .expect( 401 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot delete categories of other user', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();
            
            const cateogryOfUser2   = await factory.createCategory( user2.id );
            const tokenForUser1     = factory.createTokenForUser( user1 );

            const route = `/users/${user1.id}/categories/${cateogryOfUser2.id}`;

            await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot delete categories of other user even if :user_id and :category_id are ok', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();
            
            const cateogryOfUser2   = await factory.createCategory( user2.id );
            const tokenForUser1     = factory.createTokenForUser( user1 );

            const route = `/users/${user2.id}/categories/${cateogryOfUser2.id}`;

            await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user cannot remove a category if it has an entry associated', async () => {
            const user = await factory.createUser();
            
            const category   = await factory.createCategory( user.id );
            const entry      = await factory.createEntry( user.id );
            
            const token      = factory.createTokenForUser( user );
            const route      = `/users/${user.id}/categories/${category.id}`;

            await entry.setCategories([ category.id ]);

            await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${token}` )
                .expect( 409 )
                .expect( 'Content-Type', /json/ );
        });

        it( 'A given user can delete your own category', async () => {
            const user1 = await factory.createUser();
            
            const category          = await factory.createCategory( user1.id );
            const tokenForUser1     = factory.createTokenForUser( user1 );

            const route = `/users/${user1.id}/categories/${category.id}`;

            const response = await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            const deletedCategory = await models.Category.findOne({ where: { id: category.id } });
            
            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( deletedCategory ).to.be.equal( null );
        });

        it( 'Admins can delete category of any user', async () => {
            const user      = await factory.createUser(); 
            const admin     = await factory.createUser( null, 'admin' ); 
            const category  = await factory.createCategory( user.id );
            
            const route = `/users/${user.id}/categories/${category.id}`;
            const token = factory.createTokenForUser( admin );
    
            const response = await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${token}` );

            const deletedCategory = await models.Category.findOne({ where: { id: category.id } });
            
            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( deletedCategory ).to.be.equal( null );
        });
    });
});
