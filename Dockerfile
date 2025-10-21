FROM clockworklabs/spacetime:latest AS module
WORKDIR /app

COPY --chown=spacetime:spacetime server .
RUN spacetime build \
    && mv /app/obj/Release/net8.0/wasi-wasm/wasm/for-publish/StdbModule.wasm pogly.wasm

FROM node:25-alpine3.21 AS web
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM clockworklabs/spacetime:latest

USER root

RUN apt-get update \
    && apt-get install -y caddy \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=web /app/build /usr/share/caddy
COPY --from=module /app/pogly.wasm /app/pogly.wasm
COPY docker/Caddyfile /etc/caddy/
COPY docker/entrypoint.sh /app/entrypoint.sh

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
EXPOSE 80/tcp
VOLUME /stdb
VOLUME /etc/spacetimedb
ENV MODULES=pogly