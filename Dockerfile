FROM mcr.microsoft.com/dotnet/sdk:8.0 AS module
WORKDIR /app

# binaryen is wasm optimization, spacetime build complains if this isn't installed
RUN apt-get update && apt-get install -y binaryen \
    && curl -sL https://github.com/clockworklabs/SpacetimeDB/releases/download/v0.11.1-beta/spacetime.linux-amd64.tar.gz | tar -xzC /usr/bin/ \
    && chmod +x /usr/bin/spacetime \
    && dotnet workload install wasi-experimental

COPY server .
RUN spacetime build \
    && mv /app/obj/Release/net8.0/wasi-wasm/wasm/for-publish/StdbModule.wasm pogly.wasm

FROM node:20-alpine AS web
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM clockworklabs/spacetimedb:764ac89-full
RUN apt-get update \
    && apt-get install -y caddy \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=web /app/build /usr/share/caddy
COPY --from=module /usr/bin/spacetime /usr/bin/spacetime
COPY --from=module /app/pogly.wasm /app/pogly.wasm
COPY docker/Caddyfile /etc/caddy/
COPY docker/entrypoint.sh /app/entrypoint.sh

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
EXPOSE 80/tcp
VOLUME /stdb
VOLUME /etc/spacetimedb
ENV MODULES=pogly