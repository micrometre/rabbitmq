var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');


/* GET home page. */
router.get('/', function(req, res, next) {
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            var exchange = 'logs';
            var msg = process.argv.slice(2).join(' ') || 'Hello Worlddd!';
    
            channel.assertExchange(exchange, 'fanout', {
                durable: false
            });
            channel.publish(exchange, '', Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });
    
        setTimeout(function() {
            //connection.close();
            //process.exit(0);
        }, 500);
    });


  res.render('index', { title: 'Express' });
});

module.exports = router;
