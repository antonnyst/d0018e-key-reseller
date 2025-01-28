# d0018e-key-reseller

## Database

We run an MariaDB through the dockerfile.

## API

in /api

The API is ran through express.js on port 3333

## Web

The g3a folder, which is an expo project. React framework to design the website.

This website is then compiled into static html which is served by the /web folders express project.

## Docker

The dockerfile merges all these parts into an automated setup which can be run using the commands

`docker build . -t g3a`

`docker run -p 80:80 -p 3333:3333 g3a`