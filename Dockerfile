FROM node:10-alpine

ENV SERVICE_VERSION $SERVICE_VERSION
ENV BUILD_NUMBER $BUILD_NUMBER

RUN mkdir -p /usr/local/lib/service

WORKDIR /usr/local/lib/service

COPY ./target/bundle.js   /usr/local/lib/service

RUN ln -s /config /usr/local/lib/service/config
RUN ln -s /var/log/periscope /usr/local/lib/service/logs

CMD [ "node", "/usr/local/lib/service/bundle.js" ]

VOLUME ["/config"]
VOLUME ["/var/log/periscope"]

EXPOSE 80
