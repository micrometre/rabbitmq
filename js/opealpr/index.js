const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')


const amqp = require('amqplib');
const SSE = require('express-sse');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const sse = new SSE();
app.use(express.static(path.join(__dirname, 'public')));

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
  const interval = setInterval(() => {
  }, 1000);
  req.on('close', () => {
    clearInterval(interval);
  });
});

app.get('/events1', (req, res) => {
  //getting res.flush is not a function in express-sse https://github.com/dpskvn/express-sse/issues/28 
  res.flush = function () { /* Do nothing */ }
  sse.init(req, res);
  const interval = setInterval(() => {
    const randomData = Math.random();
    sse.send({ message: 'Hello from SSE!' });
    //sse.send({ message: randomData });
  }, 1000);
  req.on('close', () => {
    clearInterval(interval);
  });
});

app.post('/anpr', (req, res) => {
  console.log(req.body.results[0].plate);
  res.send('POST request to the homepage')
})



app.get('/video', (req, res) => {
  res.sendFile('alprVideo.mp4', { root: 'public/videos'});
})


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});