#!/bin/bash
exec socat FD:$NODE_CHANNEL_FD "EXEC:ssh $1 python -u -c exec\\\\\\\(raw_input\\\\\\\(\\\\\\\)[1:-1]\\\\\\\) $2"
