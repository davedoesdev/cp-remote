#!/bin/bash
exec socat FD:$NODE_CHANNEL_FD "EXEC:ssh $1 python -u -c exec\\\\\\\(getattr\\\\\\\(__builtins__,\\\\\\\'raw_input\\\\\\\',lambda:open\\\\\\\(0,\\\\\\\'rb\\\\\\\',buffering=0,closefd=False\\\\\\\).readline\\\\\\\(\\\\\\\)[0:-1]\\\\\\\)\\\\\\\(\\\\\\\)[1:-1]\\\\\\\) $2"
