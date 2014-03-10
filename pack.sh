#!/bin/bash
cd "$(dirname "$0")"
cat > packed.js <<EOF
module.exports = "exec('$(xxd -p cp-remote.py | tr -d '\n')'.decode('hex_codec'))"
EOF
