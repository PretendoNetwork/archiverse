#!/bin/sh

# This is required as environment variables are baked into the build, so to have runtime
# configuration, we run the build to bundle the environment variables into the build

npm run build

node server.js
