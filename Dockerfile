FROM node:alpine

RUN apk add --no-cache mariadb mariadb-client
RUN apk add --no-cache npm
RUN apk add --no-cache alpine-sdk make python3

RUN adduser admin -D -H

EXPOSE 80

VOLUME "/var/lib/maria"

ADD start.sh /
RUN chmod +x /start.sh 
ADD db_init.sh /
RUN chmod +x /db_init.sh

COPY api /api
WORKDIR /api
RUN npm install
RUN npm rebuild bcrypt --build-from-source

COPY g3a /g3a
WORKDIR /g3a
RUN npm install
RUN npm run build

CMD ["/start.sh"]
