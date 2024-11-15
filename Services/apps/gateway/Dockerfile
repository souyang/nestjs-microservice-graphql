FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY ./apps/gateway ./apps/gateway

WORKDIR /app/apps/gateway

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
