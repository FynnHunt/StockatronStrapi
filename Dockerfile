FROM node:10

WORKDIR /usr/app

COPY . .

RUN npm install --quiet

VOLUME ["/sqlitedata"]

CMD npm run develop