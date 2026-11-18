FROM node:18-alpine

WORKDIR /usr/src/app

COPY services/notification-service/package*.json ./

RUN --mount=type=secret,id=npm_ca,target=/tmp/npm-ca.pem \
    if [ -s /tmp/npm-ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/npm-ca.pem; fi; npm install

COPY services/notification-service/src ./src

EXPOSE 3005

CMD ["node", "src/server.js"]
