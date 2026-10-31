#!/bin/sh
# Map the variables Fly's Tigris storage integration sets onto the names celld
# reads, then start the node. Everything else is plain celld configuration.
set -eu

if [ -z "${CELLD_BUCKET:-}" ] && [ -n "${BUCKET_NAME:-}" ]; then
  CELLD_BUCKET="s3://${BUCKET_NAME}"
fi
if [ -z "${S3_ENDPOINT:-}" ] && [ -n "${AWS_ENDPOINT_URL_S3:-}" ]; then
  S3_ENDPOINT="${AWS_ENDPOINT_URL_S3}"
fi

if [ -z "${CELLD_BUCKET:-}" ]; then
  echo "celld: set CELLD_BUCKET (or attach Fly storage so BUCKET_NAME is set)" >&2
  exit 1
fi

export CELLD_BUCKET
export CELLD_ADDR="${CELLD_ADDR:-0.0.0.0:8080}"
export CELLD_INTERNAL_ADDR="${CELLD_INTERNAL_ADDR:-127.0.0.1:8081}"
export CELLD_WATCH="${CELLD_WATCH:-/tmp/celld}"
if [ -n "${S3_ENDPOINT:-}" ]; then export S3_ENDPOINT; fi

exec celld
