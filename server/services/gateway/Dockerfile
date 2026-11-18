FROM node:18-alpine

WORKDIR /usr/src/app

COPY services/gateway/package*.json ./

RUN --mount=type=secret,id=npm_ca,target=/tmp/npm-ca.pem \
    if [ -s /tmp/npm-ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/npm-ca.pem; fi; npm install

COPY services/gateway/src ./src
COPY services/gateway/test ./test

EXPOSE 3000

CMD ["node", "src/server.js"]
