FROM mcr.microsoft.com/dotnet/sdk:8.0 AS module
WORKDIR /app

#COPY . /app

# wasm optimization, spacetime build complains if this isn't installed
RUN apt-get update && apt-get install -y jq binaryen

# Download and install the latest spacetime cli
RUN curl -sL https://github.com/clockworklabs/SpacetimeDB/releases/latest/download/spacetime.linux-amd64.tar.gz | tar -xzC /usr/bin/ \
        && chmod +x /usr/bin/spacetime

RUN curl -sL https://codeload.github.com/PoglyApp/pogly-standalone/tar.gz/refs/heads/main | tar -xz --strip-components 1

RUN dotnet workload install wasi-experimental \
    && spacetime build -p server

FROM node:20-alpine AS web
WORKDIR /app
COPY --from=module /app/ /app/

RUN npm install && npm run build

FROM clockworklabs/spacetimedb

RUN apt-get update && apt-get install -y caddy && apt-get clean

COPY --from=web /app/build/ /usr/share/caddy
COPY --from=module /usr/bin/spacetime /usr/bin/spacetime
COPY --from=module /app/server/obj/Release/net8.0/wasi-wasm/wasm/for-publish/StdbModule.wasm /app/pogly.wasm
COPY Caddyfile /etc/caddy/
COPY start.sh /app/start.sh

# The single ampersand on the sleep command is intentional, we need the server running when we publish the module
# The sleep command is to wait for the server to start. It isn't a great solution, it should ideally replaced with something that checks for the server to be online
RUN /usr/local/bin/spacetimedb start --listen-addr 0.0.0.0:3000 \
        & sleep 2 \
        && spacetime publish -w /app/pogly.wasm -s local pogly \
        && rm -r /usr/bin/spacetime /app/pogly.wasm /root/.spacetime /var/log/spacetimedb.log.*

ENTRYPOINT ["/bin/sh", "/app/start.sh"]
EXPOSE 80
VOLUME /stdb