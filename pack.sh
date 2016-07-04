#!/bin/bash
cd "$(dirname "$0")"
cat > packed.js <<EOF
module.exports = "import binascii;exec(binascii.unhexlify('$(xxd -p cp-remote.py | tr -d '\n')'))"
EOF
