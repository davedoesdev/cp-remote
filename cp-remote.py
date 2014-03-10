#!/usr/bin/env python

import socket
import subprocess
import os
import sys
import threading

args = raw_input()[1:-1]

s1,s2 = socket.socketpair()

p1 = subprocess.Popen(['socat', '-', 'FD:' + str(s1.fileno())])

env = dict(os.environ)
env['NODE_CHANNEL_FD'] = str(s2.fileno())

p2 = subprocess.Popen(['node', '-e', 'process.argv = [process.argv[0], process.argv[1]].concat(JSON.parse(new Buffer(process.argv[2], "hex"))); require(require("path").resolve(process.argv[1]))', sys.argv[1], args], env=env, stdin=subprocess.PIPE, stdout=2)
p2.stdin.close()

#s1.close()
#s2.close()

done = False

class WaitThread(threading.Thread):
    def run(self):
        p1.wait()
        if not done: p2.kill()

thread = WaitThread()
thread.start()

p2.wait()
done = True
p1.kill()
