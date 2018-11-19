'use strict'

const express       = require( '../../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect       = chai.expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

const models    = require( '../../models' );
const factory   = require( '../helpers/factory.js' );
const databaseHelper   = require( '../helpers/db.js' );

describe( '#ENTRY', () => {
    before( databaseHelper.clearTables );

    it( 'Should not associate categories when create an entry', async () => {
        const user1     = await factory.createUser();
        const category1 = await factory.createCategory( user1.id );

        const routeForUser1    = `/users/${user1.id}/entries`;
        const tokenForUser1    = factory.createTokenForUser( user1 );

        await supertest
            .post( routeForUser1 )
            .set( 'Authorization', `Bearer ${tokenForUser1}` )
            .send({ 
                label: 'Entry 5', 
                type: 1, 
                value: 7.77, 
                registeredAt: new Date(), 
                categories: [ category1.id, category1.id, category1.id ] 
            })
            .expect( async res => {
                const createdEntry = await models.Entry.findOne({ where: { id: res.body.data.id }, include: [{ model:  models.Category }] })
                
                expect( res.status ).to.be.equal( 201 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( createdEntry.Categories ).to.have.lengthOf( 1 );
                expect( createdEntry.Categories[0].id ).to.be.equal( category1.id );
            });
    });

    it( 'Should not associate duplicated categories when update an entry', async () => {
        const user1     = await factory.createUser();
        const entry    = await factory.createEntry( user1.id );

        const category1 = await factory.createCategory( user1.id );
        const category2 = await factory.createCategory( user1.id );

        await entry.setCategories( [ category1.id ] );

        const routeForUser1    = `/users/${user1.id}/entries/${entry.id}`;
        const tokenForUser1    = factory.createTokenForUser( user1 );

        await supertest
            .put( routeForUser1 )
            .set( 'Authorization', `Bearer ${tokenForUser1}` )
            .send({ 
                label: 'Updated Label', 
                type: 1, 
                value: 7.77, 
                registeredAt: new Date(), 
                categories: [ category2.id, category2.id, category2.id ] 
            })
            .expect( async res => {
                const updatedEntry = await models.Entry.findOne({ where: { id: entry.id }, include: [{ model:  models.Category }] })
                
                expect( res.status ).to.be.equal( 200 );
                expect( res.type ).to.be.equal( 'application/json' );
                expect( updatedEntry.Categories ).to.have.lengthOf( 1 );
                expect( updatedEntry.Categories[0].id ).to.be.equal( category2.id );
            });
    });
});