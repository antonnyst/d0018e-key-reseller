FROM alpine:3.20

RUN apk add --no-cache mariadb mariadb-client
RUN apk add --no-cache nodejs npm

RUN adduser admin -D -H

COPY g3a-next /g3a-next

WORKDIR /g3a-next
RUN npm install
RUN npm run build

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