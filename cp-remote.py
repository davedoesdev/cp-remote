#!/usr/bin/env python

import socket
import subprocess
import os
import sys
import threading

args = getattr(__builtins__,
               'raw_input',
               lambda: open(0, 'rb', buffering=0, closefd=False).readline()[0:-1])()[1:-1]

s1,s2 = socket.socketpair()
if hasattr(os, 'set_inheritable'):
    os.set_inheritable(s1.fileno(), True)
    os.set_inheritable(s2.fileno(), True)

p1 = subprocess.Popen(['socat', '-', 'FD:' + str(s1.fileno())], close_fds=False)

env = dict(os.environ)
env['NODE_CHANNEL_FD'] = str(s2.fileno())

p2 = subprocess.Popen(['node', '-e', 'process.argv = [process.argv[0], process.argv[1]].concat(JSON.parse(new Buffer(process.argv[2], "hex"))); setImmediate(function () { require(require("path").resolve(process.argv[1])); })', sys.argv[1], args], env=env, stdin=subprocess.PIPE, stdout=2, close_fds=False)
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
