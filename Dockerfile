FROM node:0.12
MAINTAINER labs@apigee.com

ADD     . /server
WORKDIR /server
RUN     npm install

ENV    PORT 3000
EXPOSE 3000

ENV    UDP_PORT 3007
EXPOSE 3007

CMD        ["server.js"]
ENTRYPOINT ["node"]
