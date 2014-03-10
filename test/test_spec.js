/*globals describe: false,
          it: false */
/*jslint node: true, nomen: true */
"use strict";

var path = require('path'),
    crypto = require('crypto'),
    argv = require('yargs').argv,
    expect = require('chai').expect,
    async = require('async'),
    cp_remote = require('..'),
    // assume same location on each remote host
    remote = path.join(__dirname, 'remote.js');

function expr(v) { return v; }

function test(hosts, done)
{
    var ssh_conn = process.env.SSH_CONNECTION;

    async.each(hosts, function (host, cb)
    {
        var key = crypto.randomBytes(256),
            data = crypto.randomBytes(1024 * 1024),
            child = cp_remote.run(host, remote, key.toString('hex')),
            finished = false;

        child.on('error', cb);

        child.on('exit', function (code, signal)
        {
            if (!finished)
            {
                return cb(new Error('child exited too soon'));
            }

            if (code || signal)
            {
                return cb(code || signal);
            }

            cb();
        });

        child.on('message', function (msg)
        {
            if (msg.type === 'start')
            {
                child.send({type: 'data', data: data.toString('base64')});
            }
            else if (msg.type === 'digest')
            {
                var hmac = crypto.createHmac('sha256', key);
                hmac.update(data);
                expect(msg.digest).to.equal(hmac.digest('base64'));
                expr(expect(msg.ssh).to.exist);
                expect(msg.ssh).not.to.equal(ssh_conn);
                finished = true;
                //child.send({type: 'exit'});
                child.disconnect();
            }
        });
    }, done);
}

describe('cp-remote', function ()
{
    this.timeout(60 * 1000);

    if (argv.remote)
    {
        it('should run and communicate with child processes on remote hosts', function (done)
        {
            test(typeof argv.remote === 'string' ? [argv.remote] : argv.remote,
                 done);
        });
    }
});

