# My Financial Control API (MFC)
[![Build Status](https://travis-ci.org/vsilva472/mfcapi.svg?branch=master)](https://travis-ci.org/vsilva472/mfcapi) 
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/vsilva472/mfcapi/blob/master/LICENSE)


MFCApi is a api to be consumed by My Financial Control Frontend

## Installation
- Clone this repository `git clone https://github.com/vsilva472/mfcapi.git`
- In a terminal navigate to repository folder `$ cd <PATH TO REPOSITORY>/mfcapi`
- Run installer command `$ npm install`

### Configure Database
- Copy and rename config/config.sample.json to config.json
- Fill config/config.json with your database credentials

### Configure JWT
- Copy and rename config/jwt.sample.json to jwt.json
- Fill config/jwt.json with your 
```
{
    "secret": "my secret hash here", // hash salt to generate token
    "ttl": 3600  // token time to expire in seconds
}
```

### Configure Mail Options
- Copy and rename config/mail.sample.json to mail.json
- Fill config/mail.json with your 
```
{
    "host": "smtp.domain.com",
    "port": "2525",
    "from": "hello@foo.bar",
    "user": "user@foo.bar",
    "pass": "my password here"
}
```
### Run migrations
Run migrations with command `$ node_modules\.bin\sequelize db:migrate --env=XXXX` where XXXX must be your environment [development, production, test]

### License
MIT