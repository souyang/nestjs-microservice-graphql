FROM node:22
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY ./apps/user ./apps/user
WORKDIR /app/apps/user
RUN npm install
EXPOSE 4001
CMD ["npm", "run", "start:dev"]
