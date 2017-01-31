FROM node:7
MAINTAINER Mokhtar Mial <me@mokhtarmial.com>

ENV GIRU_DIR=/usr/src/giru

RUN mkdir -p $GIRU_DIR
WORKDIR $GIRU_DIR
COPY . $GIRU_DIR

RUN apt-get update && npm install && apt-get install -y \
  libav-tools

CMD ["npm", "run", "deploy"]