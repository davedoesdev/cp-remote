/*jslint node: true */
"use strict";

var crypto = require('crypto'),
    key = new Buffer(process.argv[2], 'hex');

process.nextTick(function ()
{
    process.send({type: 'start'});
});

process.on('message', function (msg)
{
    if (msg.type === 'data')
    {
        var hmac = crypto.createHmac('sha256', key);
        hmac.update(msg.data, 'base64');
        process.send({type: 'digest',
                      digest: hmac.digest('base64'),
                      ssh: process.env.SSH_CONNECTION});
    }
    else if (msg.type === 'exit')
    {
        //process.exit();
        process.disconnect();
    }
});

