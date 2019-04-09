# My Financial Control API (MFC)
[![Build Status](https://travis-ci.org/vsilva472/mfcapi.svg?branch=master)](https://travis-ci.org/vsilva472/mfcapi) 
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/vsilva472/mfcapi/blob/master/LICENSE)


MFCApi is a api to be consumed by My Financial Control Frontend

## Installation
- Clone this repository `git clone https://github.com/vsilva472/mfcapi.git`
- In a terminal navigate to repository folder `$ cd <PATH TO REPOSITORY>/mfcapi`
- Run installer command `$ npm install`

### Env Vars
This use envs to controle sensive data of application and this envs area used inside each file from `/config` folder

| Env Prefix | Description |
| --- | --- |
| DEV_ | env vars that are used in DEVELOPMENT environment |
| CI_ | env vars that are used in TEST environment (including travis) |
| PROD_ | env vars that are used in PRODUCTION environment |

### Database Envs
Open file `config/config.js` to see more details about database credentials.

| Option | Description |
| --- | --- |
| username | Database username |
| password | Database password |
| databse | Database name |
| host | Database host ex: localhost or 127.0.0.1 |
| dialect | Database dialect ex: 'mysql' |
| logging | Enable disable log queries in console |


### JWT Envs
Open file `config/jwt.js` to see more details about JWT options.

| Option | Description |
| --- | --- |
| secret | Hash for JWT token generation |
| ttl | JWT Token time to live in miliseconds |
| refreshSecret | Hash for JWT Refresh Token Generation |
| refreshTTL | Refresh Token Expiration |

**Note**: tokens expiration time usually are configured as string. Ex: `1m = 1 minute`, `1h = 1 hour`


### Mail Envs
Open file `config/mail.js` to see more details about mail options.

| Option | Description |
| --- | --- |
| host | SMTP Host ex: smtp.host.com |
| port | SMTP Port usualy 465 |
| from | Default mail from ex: me@mydomain.com |
| user | Mail Account username |
| pass | Mail Account password |

### Frontents Envs
Open file `config/fronted.js` to see more details about frontend options.
This options are used inside `modules/mailer.js`.

| Option | Description |
| --- | --- |
| frontend_url | SPA url |
| frontend_imgs | Url pointing to email images folder |
| frontend_password | SPA password recover url |


### Run migrations
Run migrations with command `$ node_modules\.bin\sequelize db:migrate --env=XXXX` where XXXX must be your environment [development, production, test]

**Note** To migration work you should setup env vars with base on environment you want to build.

### Donation
Help me to improve this project sending me some **HTMLCOIN**  
Wallet: **[HqgaiK6T1o2JP4p3p34CZp2g3XnSsSdCXp](htmlcoin:HqgaiK6T1o2JP4p3p34CZp2g3XnSsSdCXp?label=Doa%C3%A7%C3%B5es%20Github)**  

### License
MIT
