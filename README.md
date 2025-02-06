# d0018e-key-reseller

## Database

We run an MariaDB through the dockerfile.

Initial data created through `db_init.sh` script


## API

The API is ran through express.js on port 3333

## Web
The g3a folder contains the next.js project

## Docker

The dockerfile merges all these parts into an automated setup which can be run using the commands

`docker build . -t g3a`
`docker run -p 80:80 g3a`