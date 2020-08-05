FROM strapi/base

WORKDIR /usr/app

COPY ./package.json ./

RUN npm install

COPY . .

RUN npm build

EXPOSE 1337

ENV NODE_ENV production

VOLUME ["/sqlitedata"]

CMD ["npm", "start"]