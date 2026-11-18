FROM node:22-alpine

WORKDIR /usr/src/app

COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

COPY services/lounge-service/package*.json ./

RUN --mount=type=secret,id=npm_ca,target=/tmp/npm-ca.pem \
    if [ -s /tmp/npm-ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/npm-ca.pem; fi; npm install

RUN --mount=type=secret,id=npm_ca,target=/tmp/npm-ca.pem \
    if [ -s /tmp/npm-ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/npm-ca.pem; fi; npx prisma generate --schema=./prisma/schema.prisma

COPY services/lounge-service/src ./src

EXPOSE 3002

CMD ["node", "src/server.js"]
