# syntax=docker/dockerfile:1
#
# celld runs the Worker deployment in-process; the image needs the celld
# binary and esbuild (celld bundles the project during `celld deploy`).
FROM node:24-bookworm-slim

# Pin the runtime so a rebuild cannot silently change the data format.
ARG CELLD_VERSION=v0.6.3

# cp -L dereferences the installer's relative symlink so the binary is
# self-contained in /usr/local/bin instead of pointing back into /root.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gzip \
  && rm -rf /var/lib/apt/lists/* \
  && export CELLD_VERSION="$CELLD_VERSION" \
  && curl -fsSL https://celld.dev/install.sh | sh \
  && cp -L /root/.local/bin/celld /usr/local/bin/celld \
  && chmod 755 /usr/local/bin/celld \
  && npm install --global --no-fund --no-audit esbuild@0.28.2 \
  && npm cache clean --force

WORKDIR /app
COPY . .
RUN chmod +x scripts/*.sh && mkdir -p /tmp/celld

# 8080 is the public Worker listener. The peer/operator listener stays on
# loopback for a single-node fleet; see README.md before scaling out.
ENV CELLD_ADDR=0.0.0.0:8080 \
    CELLD_INTERNAL_ADDR=127.0.0.1:8081 \
    CELLD_WATCH=/tmp/celld

EXPOSE 8080
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
