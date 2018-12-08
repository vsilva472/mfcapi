'use strict'

const chai      = require( 'chai' );
const expect    = chai.expect;

const jadeCompiler = require( '../../modules/jade-compiler' );

describe( '#JADE COMPILER', () => {
    it( 'Should compile html with locals variables', done => {
        const html = jadeCompiler.compile('test', { data: '123@57'});
        expect( html ).to.contain( '123@57' );
        done();
    });

    it( 'Should compile html even if no locals are present', done => {
        const html = jadeCompiler.compile('test');
        expect( html ).to.have.lengthOf( 56 );
        done();
    });
});