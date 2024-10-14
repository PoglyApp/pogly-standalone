FROM mcr.microsoft.com/dotnet/sdk:8.0 AS module
WORKDIR /app

# binaryen is wasm optimization, spacetime build complains if this isn't installed
RUN apt-get update && apt-get install -y binaryen \
    && curl -sL https://github.com/clockworklabs/SpacetimeDB/releases/download/v0.11.1-beta/spacetime.linux-amd64.tar.gz | tar -xzC /usr/bin/ \
    && chmod +x /usr/bin/spacetime \
    && dotnet workload install wasi-experimental

COPY server .
# The single ampersand is intentional, we need the server running when we publish the module
# the build takes long enough for the server to start, this may break in the future if the server takes forever to start.
RUN spacetime start /stdb \
    & spacetime build \
    && spacetime publish -w /app/obj/Release/net8.0/wasi-wasm/wasm/for-publish/StdbModule.wasm -s local pogly

FROM node:20-alpine AS web
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM clockworklabs/spacetimedb
RUN apt-get update \
    && apt-get install -y caddy \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=web /app/build /usr/share/caddy
COPY --from=module /root/.spacetime/conf /etc/spacetime
COPY --from=module /stdb /stdb
COPY docker/Caddyfile /etc/caddy/
COPY docker/start.sh /app/start.sh

ENTRYPOINT ["/bin/sh", "/app/start.sh"]
EXPOSE 80/tcp
VOLUME /stdb
VOLUME /etc/spacetime
