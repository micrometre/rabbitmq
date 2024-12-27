const express = require('express');

const amqp = require('amqplib');
const SSE = require('express-sse');

const app = express();
const sse = new SSE();

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'task_queue';
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, (msg) => {
      try {
        const message = JSON.parse(msg.content.toString());
        sse.send(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
      channel.ack(msg);
    }, {
      noAck: false
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
};

connectToRabbitMQ();

app.get('/events', (req, res) => {
  //getting res.flush is not a function in express-sse https://github.com/dpskvn/express-sse/issues/28 
  res.flush = function () { /* Do nothing */ }
  sse.init(req, res);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});