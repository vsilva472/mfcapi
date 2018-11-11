const express       = require( '../app' );
const supertest     = require( 'supertest' )( express );
const chai          = require( 'chai' );
const expect       = chai.expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

const jwt           = require( 'jsonwebtoken' );
const jwtConfig     = require( '../config/jwt' );
const entryData  = require( './mocks/entry' );
const categoryData  = require( './mocks/category' );

let route         = '/users/';
const jwtToken = jwt.sign({ id: 1 }, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );

const { name, email, password } = require( './mocks/user' );
const models = require( '../models' );
let user;
let entry;

describe( "#User Entry",  () => {        
    before( async function () {
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        models.sequelize.options.maxConcurrentQueries = 1;
        await models.User.sync({ force: true });
        await models.Category.sync({ force: true });
        await models.Entry.sync({ force: true });
        await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        user = await models.User.create( { name, email, password } );
        category = await models.Category.create({ ...categoryData, UserId: user.id });
        entry = await models.Entry.create({ ...entryData, UserId: user.id, registeredAt: new Date() });
        route = `${route}${user.id}/entries`; 
    });

    it( "#Should not return Entries for non authenticated users", done => {
        supertest
            .get( route )
            .expect( 401 )
            .end( done );
    });

    it( "#Should return user Entries for current date", done => {
        supertest
            .get( route )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( function ( err, res ) {
                if ( err ) return done( err );

                expect( res.status ).to.be.equals( 200 );
                expect( res.body ).to.be.array();
                expect( res.body.length ).to.be.equal( 1 );
                expect( res.body[0] ).to.have.own.property( 'UserId' );
                expect( res.body[0].UserId ).to.be.equal( 1 );
                expect( res.body[0] ).to.have.own.property( 'label' );
                expect( res.body[0].label ).to.be.equal( entry.label );

                expect( res.body[0] ).to.have.own.property( 'value' );
                expect( res.body[0].value ).to.be.equal( entry.value.toString() );

                expect( res.body[0] ).to.have.own.property( 'type' );
                expect( res.body[0].type ).to.be.equal( entry.type );

                expect( res.body[0] ).to.have.own.property( 'registeredAt' );
                done();
            });
    });

    it( "#Should return user Entries by a range", done => {
        const start = new Date(2018, 1, 25);
        const end = new Date(2018, 2, 17);

        const registeredAt = new Date( 2018, 1, 30 );

        models.Entry.create({
            ...entryData, 
            registeredAt,
            UserId: user.id
        })
        .then( entry => {
            supertest
            .get( route )
            .send( { start, end })
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( function ( err, res ) {
                if ( err ) return done( err );

                expect( res.status ).to.be.equals( 200 );
                expect( res.body ).to.be.array();
                expect( res.body.length ).to.be.equal( 1 );
                
                expect( res.body[0] ).to.have.own.property( 'id' );
                expect( res.body[0].id ).to.be.equal( entry.id );
                
                expect( res.body[0] ).to.have.own.property( 'UserId' );
                expect( res.body[0].UserId ).to.be.equal( 1 );

                expect( res.body[0] ).to.have.own.property( 'label' );
                expect( res.body[0].label ).to.be.equal( entry.label );

                expect( res.body[0] ).to.have.own.property( 'value' );
                expect( res.body[0].value ).to.be.equal( entry.value.toString() );

                expect( res.body[0] ).to.have.own.property( 'type' );
                expect( res.body[0].type ).to.be.equal( entry.type );

                const timeExpected = new Date(res.body[0].registeredAt).getTime();
                expect( res.body[0] ).to.have.own.property( 'registeredAt' );
                expect( timeExpected ).to.be.equal( registeredAt.getTime() );
                
                done();
            });
        })
        .catch( err => done( err ) );
    });

    it( "#Should not create an Entry for non authenticated users", done => {
        supertest
            .post( route )
            .expect( 401 )
            .end( done );
    });

    it( "#Should not create an Entry without valid data", done => {
        supertest
            .post( route )
            .expect( 422 )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( ( err, res ) => {
                if ( err ) return done( err );
                
                expect( res.body ).to.have.own.property( 'errors' );
                expect( res.body.errors ).to.be.an.array();
                expect( res.body.errors ).to.have.lengthOf( 5 );
                
                expect( res.body.errors[0] ).to.have.own.property( 'param' );
                expect( res.body.errors[0].param ).to.be.equal( 'label' );
                
                expect( res.body.errors[1] ).to.have.own.property( 'param' );
                expect( res.body.errors[1].param ).to.be.equal( 'type' );
                
                expect( res.body.errors[2] ).to.have.own.property( 'param' );
                expect( res.body.errors[2].param ).to.be.equal( 'value' );
                
                expect( res.body.errors[3] ).to.have.own.property( 'param' );
                expect( res.body.errors[3].param ).to.be.equal( 'UserId' );
                
                expect( res.body.errors[4] ).to.have.own.property( 'param' );
                expect( res.body.errors[4].param ).to.be.equal( 'registeredAt' );
                done();
            });
    });

    it( "#Should create an Entry with one Category", done => {
        models.User.create({
            email: 'other@email.cc',
            name: 'Other name',
            password: '123456789'
        })
        .then( otherUser => {
            return models.Entry.create({
                ...entryData,
                label: "Other Entry",
                UserId: otherUser.id,
                registeredAt: new Date()
            });
        })
        .then( otherEntry => {
            return models.Category.create({
                label: 'Other Category',
                color: '#000000'
            })
            .then( otherCategory => {
                return otherEntry.setCategories([ otherCategory.id ]);
            });
        })
        .then( () => {
            supertest
            .post( route )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .send({ ...entryData, UserId: user.id, registeredAt: new Date(), categories: [ category.id ] })
            .end( async function ( err, res ) {
                if ( err ) return done( err );
                
                models.Entry.findOne({
                    where: { id: res.body.data.id },
                    include: [ models.Category ]
                })
                .then( entryWithCategories => {
                    expect( res.body ).to.have.own.property( 'data' );
                    expect( res.status ).to.be.equal( 201 );
                    expect( entryWithCategories.Categories ).to.have.lengthOf( 1 );
                    expect( entryWithCategories.Categories[0].id ).to.be.equal( 1 );
                    done();
                })
                .catch( err => done( err ) );
            });
        })
        .catch( err => done( err ) );
    });

    it( "#Should return details of an Entry", done => {
        entry.setCategories([ category.id ])
        .then( () => {
            supertest
            .get( `${route}/${entry.id}` )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .end( function ( err, res ) {
                if ( err ) return done( err );

                expect(res.status).to.be.equal(200);

                expect( res.body ).to.has.own.property( 'id' );
                expect( res.body ).to.has.own.property( 'label' );
                expect( res.body ).to.has.own.property( 'type' );
                expect( res.body ).to.has.own.property( 'value' );

                expect( res.body.id ).to.be.equal(entry.id);
                expect( res.body.label ).to.be.equal(entry.label);
                expect( res.body.type ).to.be.equal(entry.type);
                expect( res.body.value ).to.be.equal( entry.value.toString() );
                expect( res.body.UserId ).to.be.equal( entry.UserId);
                expect( res.body.Categories ).to.be.an.array();
                expect( res.body.Categories ).to.have.lengthOf(1);
                done();
            });
        } )
        .catch( err => done( err ) );
    });
    
    it( "#Should update an Entry", done => {
        const paramsToUpdate = { label: "Updated Label", value: 7.77, type: 1, registeredAt: new Date( 2012, 11, 11 ) };
                
        supertest
            .put( `${route}/${entry.id}` )
            .set( 'Authorization', `Bearer ${jwtToken}` )
            .send( paramsToUpdate )
            .end( ( err, res ) => {
                if ( err ) return done( err );

                models.Entry.findOne({ where: { id: entry.id } })
                .then( updatedEntry => {

                    expect( res.status ).to.be.equal( 200 );
                    expect( updatedEntry.label ).to.be.equal( paramsToUpdate.label );
                    expect( updatedEntry.value ).to.be.equal( paramsToUpdate.value.toString() );
                    expect( updatedEntry.type ).to.be.equal( paramsToUpdate.type );
                    expect( updatedEntry.registeredAt.getTime() ).to.be.equal( paramsToUpdate.registeredAt.getTime() );
                    done();
                })
                .catch( err => done( err ) );
            });
    });

    it( "#Should remove an Entry from database", done => {                
        const rt = `${route}/${entry.id}`;
        
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