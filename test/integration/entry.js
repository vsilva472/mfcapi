'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect       = chai.expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

const models    = require( '../../models' );

const factory           = require( '../helpers/factory.js' );
const databaseHelper    = require( '../helpers/db.js' );

describe( "#User Entries",  () => {
    before( databaseHelper.clearTables );

    describe( '#LIST', () => {
        it( 'Anonymous user cannot list users', done => {
            supertest
                .get( '/users/1/entries' )
                .expect( 401 )
                .end( done );
        });

        it( 'A given user cannot list entry from other user', async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();

            const routeForUser2      = `/users/${user2.id}/entries`;
            const tokenForUser1      = factory.createTokenForUser( user1 );  
    
            await factory.createEntry( user1.id );
            await factory.createEntry( user2.id );
    
            await supertest
                .get( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 );
        });

        it( 'A given user can list your own entries', async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();

            const routeForUser1      = `/users/${user1.id}/entries`;
            const tokenForUser1      = factory.createTokenForUser( user1 );  
    
            await factory.createEntry( user1.id );
            await factory.createEntry( user2.id );
    
            const response = await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            expect( response.status ).to.be.equal( 200 );
            expect( response.body ).to.be.an.array();
            expect( response.body ).to.have.lengthOf( 1 );
            expect( response.body[ 0 ] ).to.have.own.property( 'UserId' );
            expect( response.body[ 0 ].UserId ).to.be.equal( user1.id );
        });

        it( 'Admins can list entries of any user', async () => {
            const user1      = await factory.createUser();
            const user2      = await factory.createUser();
            const admin      = await factory.createUser( null, 'admin' );

            const routeForUser1      = `/users/${user1.id}/entries`;
            const tokenForAdmin      = factory.createTokenForUser( admin );  
    
            await factory.createEntry( user1.id );
            await factory.createEntry( user2.id );

            const response = await supertest
                .get( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` );

            expect( response.status ).to.be.equal( 200 );
            expect( response.body ).to.be.an.array();
            expect( response.body ).to.have.lengthOf( 1 );
            expect( response.body[ 0 ] ).to.have.own.property( 'UserId' );
            expect( response.body[ 0 ].UserId ).to.be.equal( user1.id );
        });
    });

    describe( '#SHOW', () => {
        it( 'Anonymous cannot view an entry', done => {
                supertest
                    .get( '/users/1/entries/1' )
                    .expect( 401 )
                    .end( done );
        });

        it( 'A given user cannot view an entry of other users', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();
            
            const entryForUser1  = await factory.createEntry( user1.id );
            const entryForUser2  = await factory.createEntry( user2.id );

            const tokenForUser1     = factory.createTokenForUser( user1 ); 
            const routeForEntry1    = `/users/${user1.id}/entries/${entryForUser2.id}`;

            await supertest
                .get( routeForEntry1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 );
        });

        it( 'A given user cannot view an entry of other users even if he pass correct :user_id and :entry_id', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();
            
            const entryForUser1  = await factory.createEntry( user1.id );
            const entryForUser2  = await factory.createEntry( user2.id );

            const tokenForUser1     = factory.createTokenForUser( user1 ); 
            const routeForEntry2    = `/users/${user2.id}/entries/${entryForUser2.id}`;

            await supertest
                .get( routeForEntry2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 );
        });

        it( 'A given user can view your own entries', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();
            
            const entryForUser1  = await factory.createEntry( user1.id );
            const entryForUser2  = await factory.createEntry( user2.id );

            const tokenForUser1     = factory.createTokenForUser( user1 ); 
            const routeForEntry1    = `/users/${user1.id}/entries/${entryForUser1.id}`;

            const response = await supertest
                .get( routeForEntry1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'UserId' );
            expect( response.body.UserId ).to.be.equal( user1.id );
        });

        it( 'Admins can view entries of any user', async () => {
            const user      = await factory.createUser();
            const admin     = await factory.createUser( null, 'admin' );
            
            const entry     = await factory.createEntry( user.id );

            const tokenForAdmin    = factory.createTokenForUser( admin ); 
            const routeForEntry    = `/users/${user.id}/entries/${entry.id}`;

            const response = await supertest
                .get( routeForEntry )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` );

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'UserId' );
            expect( response.body.UserId ).to.be.equal( user.id );
        });
    });

    describe( '#CREATE', () => {
        it( 'Anonymous users cannot create entries', done => {
            supertest
                .post( '/users/1/entries' )
                .expect( 401 )
                .end( done );
        });

        it( 'A given user cannot create an entry for another user', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const routeForUser2 = `/users/${user2.id}/entries`;
            const tokenForUser1 = factory.createTokenForUser( user1 ); 

            await supertest
                .post( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send({ label: 'My Entry', type: 1, value: 5.77, registeredAt: new Date() })
                .expect( 403 );
        });

        it( 'A given user cannot create an entry with invalid data', async () => {
            const user1 = await factory.createUser();
  
            const routeForUser1 = `/users/${user1.id}/entries`;
            const tokenForUser1 = factory.createTokenForUser( user1 ); 

            await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( res => {
                    expect( res.status ).to.be.equals( 422 );
                    
                    expect( res.body ).to.have.own.property( 'errors' );
                    expect( res.body.errors ).to.be.an.array();
                    expect( res.body.errors ).to.have.lengthOf( 4 );
                    
                    expect( res.body.errors[0] ).to.have.own.property( 'param' );
                    expect( res.body.errors[0].param ).to.be.equal( 'label' );
                    
                    expect( res.body.errors[1] ).to.have.own.property( 'param' );
                    expect( res.body.errors[1].param ).to.be.equal( 'type' );
                    
                    expect( res.body.errors[2] ).to.have.own.property( 'param' );
                    expect( res.body.errors[2].param ).to.be.equal( 'value' );
                    
                    expect( res.body.errors[3] ).to.have.own.property( 'param' );
                    expect( res.body.errors[3].param ).to.be.equal( 'registeredAt' );
                });
        });

        it( 'A given user can create your own entries', async () => {
            const user1 = await factory.createUser();

            const routeForUser1 = `/users/${user1.id}/entries`;
            const tokenForUser1 = factory.createTokenForUser( user1 ); 
            const now = new Date();

            const response = await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send({ label: 'My Entry', type: 1, value: 5.77, registeredAt: now });

            expect( response.statusCode ).to.be.equal( 201 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'data' );
            expect( response.body.data.UserId ).to.be.equal( user1.id.toString() );
            expect( response.body.data.label ).to.be.equal( 'My Entry' );
            expect( response.body.data.type ).to.be.equal( 1 );
            expect( response.body.data.value ).to.be.equal( 5.77 );
            expect( response.body.data.registeredAt ).to.be.equal( now.toISOString() );

        });

        it( 'A given user cannot create an entry with categories of other user', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();

            const categoryForUser2 = await factory.createCategory( user2.id );
            const categoryForUser1 = await factory.createCategory( user1.id );

            const routeForUser1 = `/users/${user1.id}/entries`;
            const tokenForUser1 = factory.createTokenForUser( user1 ); 
            const now = new Date();

            const response = await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send({ 
                    label: 'My Entry', type: 1, value: 5.77, registeredAt: now, 
                    categories: [ categoryForUser1.id, categoryForUser2.id  ] 
                });

            expect( response.statusCode ).to.be.equals( 422 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'errors' );
            expect( response.body.errors ).to.be.an.array();
            expect( response.body.errors ).to.have.lengthOf( 1 );
            expect( response.body.errors[0] ).to.have.own.property( 'param' );
            expect( response.body.errors[0].param ).to.be.equal( 'categories' );
        });

        it( 'A given user can create an entry with your own categories', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();
    
            const category1 = await factory.createCategory( user1.id );
            const category2 = await factory.createCategory( user1.id );
            
            // category for other user not is expected inside result
            await factory.createCategory( user2.id );

            const routeForUser1 = `/users/${user1.id}/entries`;
            const tokenForUser1 = factory.createTokenForUser( user1 ); 
            const now = new Date();

            const response = await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send({ 
                    label: 'My Entry', type: 1, value: 5.77, registeredAt: now, 
                    categories: [ category1.id, category2.id  ] 
                });
            
            expect( response.statusCode ).to.be.equals( 201 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'data' );
                    // ToDo check categories ids
        });

        it( 'Admins can create entries for any user', async () => {
            const user1 = await factory.createUser();
            const admin = await factory.createUser( null, 'admin' );

            const routeForUser1 = `/users/${user1.id}/entries`;
            const tokenForAdmin = factory.createTokenForUser( admin ); 
            const now = new Date();

            const response = await supertest
                .post( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` )
                .send({ label: 'My Entry', type: 1, value: 5.77, registeredAt: now });

            expect( response.statusCode ).to.be.equal( 201 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.body ).to.have.own.property( 'data' );
            expect( response.body.data.UserId ).to.be.equal( user1.id.toString() );
            expect( response.body.data.label ).to.be.equal( 'My Entry' );
            expect( response.body.data.type ).to.be.equal( 1 );
            expect( response.body.data.value ).to.be.equal( 5.77 );
            expect( response.body.data.registeredAt ).to.be.equal( now.toISOString() );
        });
    });

    describe( '#UPDATE', () => {
        it( 'Anonymous user cannot update an entry', done => {
            supertest
                .put( '/users/1/entries/1' )
                .expect( 401 )
                .end( done );
        });

        it( 'A given user cannot update an entry of other user', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();

            const entryForUser2 = await factory.createEntry( user2.id );
            const tokenForUser1 = factory.createTokenForUser( user1 );

            const route = `/users/${user1.id}/entries/${entryForUser2.id}`;

            await supertest
                .put( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( { label: 'Updated Label', type: 1, value: 7.77, registeredAt: new Date() } )
                .expect( 403 );
        });

        it( "A given user cannot update an entry of other users EVEN if other :user_id and :entry_id are corrects", async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();

            const entryForUser2    = await factory.createEntry( user2.id );
            const routeForUser2    = `/users/${user2.id}/entries/${entryForUser2.id}`;
            const tokenForUser1    = factory.createTokenForUser( user1 );

            await supertest
                .put( routeForUser2 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( { label: 'Updated Label', type: 1, value: 7.77, registeredAt: new Date() } )
                .expect( 403 );
        });

        it( 'A given user cannot update an entry with invalid data', async () => {
            const user1 = await factory.createUser();
            const entry = await factory.createEntry( user1.id );
  
            const routeForUser1 = `/users/${user1.id}/entries/${entry.id}`;
            const tokenForUser1 = factory.createTokenForUser( user1 ); 

            await supertest
                .put( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( res => {
                    expect( res.status ).to.be.equals( 422 );
                    
                    expect( res.body ).to.have.own.property( 'errors' );
                    expect( res.body.errors ).to.be.an.array();
                    expect( res.body.errors ).to.have.lengthOf( 4 );
                    
                    expect( res.body.errors[0] ).to.have.own.property( 'param' );
                    expect( res.body.errors[0].param ).to.be.equal( 'label' );
                    
                    expect( res.body.errors[1] ).to.have.own.property( 'param' );
                    expect( res.body.errors[1].param ).to.be.equal( 'type' );
                    
                    expect( res.body.errors[2] ).to.have.own.property( 'param' );
                    expect( res.body.errors[2].param ).to.be.equal( 'value' );
                    
                    expect( res.body.errors[3] ).to.have.own.property( 'param' );
                    expect( res.body.errors[3].param ).to.be.equal( 'registeredAt' );
                });
        });
    
        it( "A given user can update your own entry", async () => {
            const user1     = await factory.createUser();

            const entryForUser1    = await factory.createEntry( user1.id );
            const routeForUser1    = `/users/${user1.id}/entries/${entryForUser1.id}`;
            const tokenForUser1    = factory.createTokenForUser( user1 );

            await supertest
                .put( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send( { label: 'Updated Label', type: 1, value: 7.77, registeredAt: new Date() } )
                .expect( 200 );
        });

        it( 'A given user cannot update an entry with categories of other user', async () => {
            const user1     = await factory.createUser();
            const user2     = await factory.createUser();
            
            const entryForUser1    = await factory.createEntry( user1.id );

            const categoryForUser1 = await factory.createCategory( user1.id );
            const categoryForUser2 = await factory.createCategory( user2.id );

            const routeForUser1    = `/users/${user1.id}/entries/${entryForUser1.id}`;
            const tokenForUser1    = factory.createTokenForUser( user1 );

            await supertest
                .put( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .send({ 
                    label: 'Updated Label', 
                    type: 1, 
                    value: 7.77, 
                    registeredAt: new Date(), 
                    categories: [ categoryForUser2.id ] 
                })
                .expect( 422 )
                .expect( 'Content-Type', /json/ );
        }); 

        it( 'A given user can update an entry with your own categories', async () => {
            const user1     = await factory.createUser();
           
            const entry    = await factory.createEntry( user1.id );

            const category1 = await factory.createCategory( user1.id );
            const category2 = await factory.createCategory( user1.id );

            await entry.setCategories( [ category1.id ] );

            const routeForUser1    = `/users/${user1.id}/entries/${entry.id}`;
            const tokenForUser1    = factory.createTokenForUser( user1 );

            const payload = { 
                label: 'Updated Label', 
                type: 1, 
                value: 7.77, 
                registeredAt: new Date(), 
                categories: [ category2.id ] 
            };

            const response      = await supertest.put( routeForUser1 ).set( 'Authorization', `Bearer ${tokenForUser1}` ).send( payload );
            const updatedEntry  = await models.Entry.findOne({ where: { id: entry.id }, include: [{ model:  models.Category }] })
            
            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( updatedEntry.Categories ).to.have.lengthOf( 1 );
            expect( updatedEntry.Categories[0].id ).to.be.equal( category2.id );
        }); 

        it( "Admins can update entries for any user", async () => {
            const user1     = await factory.createUser();
            const admin     = await factory.createUser( null, 'admin' );

            const entryForUser1    = await factory.createEntry( user1.id );
            const routeForUser1    = `/users/${user1.id}/entries/${entryForUser1.id}`;
            const tokenForAdmin    = factory.createTokenForUser( admin );

            await supertest
                .put( routeForUser1 )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` )
                .send( { label: 'Updated Label', type: 1, value: 7.55, registeredAt: new Date() } )
                .expect( 200 );
        });
        
    });

    describe( '#DELETE', () => {
        it( 'Anonymous user cannot delete an entry', done => {
            supertest
                .delete( '/users/1/entries/1' )
                .expect( 401 )
                .end( done );
        });

        it( 'A given user cannot delete an entry of others users', async () => {
            const user1 = await factory.createUser();
            const user2 = await factory.createUser();
            
            const entryOfUser2 = await factory.createEntry( user2.id );
            const route = `/users/${user1.id}/entries/${entryOfUser2.id}`;
            const tokenForUser1 = factory.createTokenForUser( user1.id );

            await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` )
                .expect( 403 );
        });

        it( 'A given user can delete your own entry', async () => {
            const user1 = await factory.createUser();
            
            const entry = await factory.createEntry( user1.id );
            const route = `/users/${user1.id}/entries/${entry.id}`;
            const tokenForUser1 = factory.createTokenForUser( user1 );

            const response = await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            const deletedEntry = await models.Entry.findOne({ where: { id: entry.id } });

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( deletedEntry ).to.be.equal( null );
        });

        it( 'A given user can delete your own entry and mantain your categories', async () => {
            const user1 = await factory.createUser();          
            const entry = await factory.createEntry( user1.id );
            const category = await factory.createCategory( user1.id );

            await entry.setCategories([ category.id ]);

            const route = `/users/${user1.id}/entries/${entry.id}`;
            const tokenForUser1 = factory.createTokenForUser( user1 );

            const response = await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForUser1}` );

            const deletedEntry = await models.Entry.findOne({ where: { id: entry.id } });
            const cat   = await models.Category.findOne({ where: { id: category.id }, include: [{ model: models.Entry }] });

            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( deletedEntry ).to.be.equal( null );
            expect( cat ).to.not.be.equal( null );
            expect( cat.id ).to.be.equal( category.id );
            expect( cat.UserId ).to.be.equal( category.UserId );
            expect( cat.Entries ).to.have.lengthOf( 0 );
        });

        it( 'Admins can delete users entries', async () => {
            const user1 = await factory.createUser();
            const admin = await factory.createUser( null, 'admin' );
            
            const entry = await factory.createEntry( user1.id );
            const route = `/users/${user1.id}/entries/${entry.id}`;
            
            const tokenForAdmin = factory.createTokenForUser( admin );

            const response = await supertest
                .delete( route )
                .set( 'Authorization', `Bearer ${tokenForAdmin}` );
            
            const deletedEntry = await models.Entry.findOne({ where: { id: entry.id } });
            
            expect( response.statusCode ).to.be.equal( 200 );
            expect( response.type ).to.be.equal( 'application/json' );
            expect( deletedEntry ).to.be.equal( null );
        });
    });
});