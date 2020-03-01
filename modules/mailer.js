'use strict'

const htmlCompiler = require( './html-compiler' );
const mailer = require( 'nodemailer' );
const env = process.env.NODE_ENV || 'development';
const { host, user, pass, port, from } = require( '../config/mail' );
const frontendVars = require( '../config/frontend' );

const transport = mailer.createTransport({
    host, port,
    auth: { user, pass }
});

exports.send = ( to, subject, template, locals, callback ) => {
    if ( env === 'test' ) return callback( null, true );
    
    const options = {...locals, ...frontendVars };
    const html = htmlCompiler.compile( template, options );

    transport.sendMail({ to, from, subject, html }, callback);
};