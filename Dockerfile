FROM alpine:3.20

RUN apk add --no-cache mariadb mariadb-client
RUN apk add --no-cache nodejs npm

RUN adduser admin -D -H

COPY g3a /g3a
COPY web /web 

WORKDIR /g3a
RUN npm install
RUN npx expo export --platform web --output-dir /web/public

WORKDIR /web
RUN npm install

COPY api /api
WORKDIR /api
RUN npm install

EXPOSE 3306 3333 80

VOLUME "/var/lib/maria"

ADD start.sh /
RUN chmod +x /start.sh 
ADD db_init.sh /
RUN chmod +x /db_init.sh

CMD ["/start.sh"]