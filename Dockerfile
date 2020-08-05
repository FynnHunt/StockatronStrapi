FROM strapi/base

WORKDIR /usr/app

ENV NODE_ENV production

COPY ./package.json ./

RUN npm install

COPY . .

RUN npm build

EXPOSE 1337

VOLUME ["/sqlitedata"]

CMD ["npm", "start"]