'use strict'

const chai      = require( 'chai' );
const expect    = chai.expect;

const htmlCompiler = require( '../../modules/html-compiler' );

describe( '#HTML COMPILER', () => {
    it( 'Should compile html with locals variables', done => {
        const html = htmlCompiler.compile('test', { data: '123@57'});
        expect( html ).to.contain( '123@57' );
        done();
    });

    it( 'Should compile html even if no locals are present', done => {
        const html = htmlCompiler.compile('test');
        expect( html ).to.have.lengthOf( 55 );
        done();
    });
});