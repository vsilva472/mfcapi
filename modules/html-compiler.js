'use strict'

const pug = require( 'pug' );

exports.compile = ( template_name, locals = {} ) => {
    const path = `${process.cwd()}/views/${template_name}.pug`;
    return pug.renderFile( path, locals );
}
