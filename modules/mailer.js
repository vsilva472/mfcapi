'use strict'

const jadeCompiler = require( './jade-compiler' );
const mailer = require( 'nodemailer' );
const env = process.env.NODE_ENV || 'development';
const { host, user, pass, port, from } = require( '../config/mail' )[ env ];
const frontendVars = require( '../config/frontend' )[ env ];

const transport = mailer.createTransport({
    host, port,
    auth: { user, pass }
});

exports.send = ( to, subject, template, locals, callback ) => {
    if ( env === 'test' ) return callback( null, true );
    
    const options = {...locals, ...frontendVars };
    const html = jadeCompiler.compile( template, options );

    transport.sendMail({ to, from, subject, html }, callback);
};