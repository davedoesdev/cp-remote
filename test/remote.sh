#!/bin/bash
cd "$(dirname "$0")"
../node_modules/.bin/grunt test \
    --remote=localhost           \
    --remote=david-desktop       \
    --remote=david-old-hp        \
    --remote=vostro-1000         \
    --remote=eeepc-eth
#    --remote=drpc               \
#    --remote=rpi

