'use strict'

const jade = require( 'jade' );

exports.compile = ( template_name, locals = {} ) => {
    const path = `${process.cwd()}/views/${template_name}.jade`;
    return jade.renderFile( path, locals );
}
