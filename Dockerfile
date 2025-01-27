FROM alpine:3.20

RUN apk add --no-cache mariadb 
RUN apk add --no-cache nodejs npm

RUN adduser admin -D -H

ADD start.sh /
RUN chmod +x /start.sh 

COPY g3a /g3a
COPY web /web 

WORKDIR /g3a
RUN npm install
RUN npx expo export --platform web --output-dir /web/public

WORKDIR /web
RUN npm install

EXPOSE 3306 80

VOLUME "/var/lib/maria"

CMD ["/start.sh"]