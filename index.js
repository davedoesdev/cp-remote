/**
# cp-remote&nbsp;&nbsp;&nbsp;[![Build Status](https://travis-ci.org/davedoesdev/cp-remote.png)](https://travis-ci.org/davedoesdev/cp-remote) [![Coverage Status](https://coveralls.io/repos/davedoesdev/cp-remote/badge.png?branch=master)](https://coveralls.io/r/davedoesdev/cp-remote?branch=master) [![NPM version](https://badge.fury.io/js/cp-remote.png)](http://badge.fury.io/js/cp-remote)

Node.js [`child_process`](http://nodejs.org/api/child_process.html) done remotely, IPC channel intact!

Example:

```javascript
var cp_remote = require('cp-remote');
var assert = require('assert');
var remote = cp_remote.run('host', '/path/on/host/to/sub.js', 'foo', { answer: 42 });
remote.on('message', function (msg)
{
    assert.deepEqual(msg, { foo: 'bar' });
});
remote.send({ hello: 'world' });
```

You might implement the remote script, `sub.js`, like this:

```javascript
var assert = require('assert');
assert.equal(process.argv[2], 'foo')
assert.deepEqual(process.argv[3], { answer: 42 });
process.on('message', function (msg)
{
    assert.deepEqual(msg, { hello: 'world' });
    process.disconnect();
});
process.send({ foo: 'bar' });
```

The API is described [here](#tableofcontents).

## Pre-requisites

Client:

- SSH client (e.g. [OpenSSH](http://www.openssh.com)), configured for password-less logon to the remote host (e.g. using a private key).
- [Node.js](http://www.nodejs.org) (of course)
- [Bash](https://www.gnu.org/software/bash/bash.html)
- [socat](http://www.dest-unreach.org/socat/) (only version 1.7.x is supported at the current time)

Remote host:

- SSH server (e.g. [OpenSSH](http://www.openssh.com))
- Node.js (`node` command should be in the remote `PATH` of SSH sessions)
- [Python](http://www.python.org) (it provides access to [`socketpair`](http://pubs.opengroup.org/onlinepubs/009695399/functions/socketpair.html), Node does not)
- [socat](http://www.dest-unreach.org/socat/) (only version 1.7.x is supported at the current time)

## Installation

```shell
npm install cp-remote
```

## Limitation

You can't pass handles to a remote child process like you can with local child processes.

## How it works

![How it works](http://githubraw.herokuapp.com/davedoesdev/cp-remote/master/diagrams/how_it_works.svg)

- `cp-remote` calls [`child_process.spawn`](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) to run a Bash script, [`cp-remote.sh`](cp-remote.sh). The IPC channel will be on `$NODE_CHANNEL_FD`.
- `cp-remote.sh` runs `socat`, telling it to relay data between `$NODE_CHANNEL_FD` and an SSH connection to the remote host.
- The SSH connection is told to start [`cp-remote.py`](cp-remote.py) on the remote host.
- `cp-remote.py` calls [`socket.socketpair`](http://docs.python.org/2.7/library/socket.html#socket.socketpair) to create a pair of connected file descriptors (Unix domain sockets).
- `cp-remote.py` starts `socat`, telling it to relay data between standard input (i.e. the SSH connection) and one of the connected file descriptors.
- `cp-remote.py` sets `NODE_CHANNEL_FD` to the other connected file descriptor and starts `node`, telling it to run the module you specified.

## Licence

[MIT](LICENCE)

## Test

To test creating and communicating with remote child processes:

```shell
grunt test --remote <host1> --remote <host2> ...
```

You can specify as many remote hosts as you like. The test will try to create a remote child process on each host and then communicate with each one.

It assumes the `cp-remote` module is installed at the same path on each host.

## Lint

```shell
grunt lint
```

## Code Coverage

```shell
grunt coverage
```

[Instanbul](http://gotwarlost.github.io/istanbul/) results are available [here](http://githubraw.herokuapp.com/davedoesdev/cp-remote/master/coverage/lcov-report/index.html).

Coveralls page is [here](https://coveralls.io/r/davedoesdev/cp-remote).

# API
*/

/*jslint node: true, nomen: true */
"use strict";

var child_process = require('child_process'),
    path = require('path'),
    packed = require('./packed');

/**
Run a Node.js module on a remote host and return a [`child_process.ChildProcess`](http://nodejs.org/api/child_process.html#child_process_class_childprocess) object for communication with it.

@param {String} host The name (or IP address) of the remote host to run the module on.
@param {String} module_path The path to the module _on the remote host_. Any arguments following `module_path` will be made available to the module in its `process.argv` (starting at the third element).
@return {child_process.ChildProcess} The `ChildProcess` object for the remote process. You can do the same things with this object as a local `ChildProcess`, except send it handles (i.e. the optional `sendHandle` parameter to [`child.send`](http://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle) isn't supported).
*/
function run(host, module_path)
{
    var child = child_process.spawn(
            path.join(__dirname, 'cp-remote.sh'),
            [host, module_path],
            { stdio: [0, 1, 2, 'ipc'] });

    child.send(packed.toString());
    child.send(new Buffer(JSON.stringify(
        Array.prototype.slice.call(arguments, 2))).toString('hex'));

    return child;
}

exports.run = run;
