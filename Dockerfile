FROM alpine:3.20

RUN apk add --no-cache mariadb 

RUN adduser admin -D -H

ADD start.sh /

RUN chmod +x /start.sh 

EXPOSE 3306

VOLUME "/var/lib/maria"

CMD ["/start.sh"]