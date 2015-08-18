FROM node:latest
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get install make

ADD . /opt/node/ciks

RUN npm set init.author.name "Maksym Rykin"
RUN npm set init.author.email "max@develab.me"
RUN npm set init.author.url "http://maxrykin.com/"

WORKDIR /opt/node/ciks/
RUN npm install

ENTRYPOINT /bin/bash /opt/node/ciks/start.sh