#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'task_queue';
        var msg = 'Hello from send script test1';
        var message = JSON.stringify(msg)

        channel.assertQueue(queue, {
            durable: true
        });
        channel.sendToQueue(queue, Buffer.from(message));

        console.log(" [x] Sent %s", msg.toString());
    });
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});