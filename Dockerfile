FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

ENV NODE_ENV production
ENV DATABASE_CLIENT postgres

EXPOSE 1337

CMD ["npm", "run", "start"]
