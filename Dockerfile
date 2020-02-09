FROM node:10

WORKDIR /usr/app

COPY . .
RUN npm install --quiet

COPY . .
VOLUME ["/sqlitedata"]

CMD "/launch.sh"