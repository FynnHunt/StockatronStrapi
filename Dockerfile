FROM node:10

WORKDIR /usr/app

ADD package.json /usr/app/package.json

ADD launch.sh /launch.sh
RUN chmod +x /launch.sh

RUN npm install --quiet

VOLUME ["/sqlitedata"]

CMD "/launch.sh"