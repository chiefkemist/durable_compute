#!/bin/sh
# Upload this project's deployment to the fleet bucket. `fly deploy` runs this
# as its release command; locally, export the same variables and run it.
set -eu

if [ -z "${CELLD_BUCKET:-}" ] && [ -n "${BUCKET_NAME:-}" ]; then
  CELLD_BUCKET="s3://${BUCKET_NAME}"
fi
if [ -z "${S3_ENDPOINT:-}" ] && [ -n "${AWS_ENDPOINT_URL_S3:-}" ]; then
  S3_ENDPOINT="${AWS_ENDPOINT_URL_S3}"
fi

if [ -z "${CELLD_BUCKET:-}" ]; then
  echo "celld deploy: CELLD_BUCKET (or BUCKET_NAME) is required" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
set -- deploy . --bucket "$CELLD_BUCKET"
# Let celld use its own region default (AWS_REGION, else us-east-1) unless the
# environment names one, e.g. AWS_REGION=auto for Cloudflare R2 or Tigris.
if [ -n "${AWS_REGION:-}" ]; then
  set -- "$@" --region "$AWS_REGION"
fi
if [ -n "${S3_ENDPOINT:-}" ]; then
  set -- "$@" --endpoint "$S3_ENDPOINT"
fi
exec celld "$@"
