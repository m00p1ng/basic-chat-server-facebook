const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 5000;

const verification = require('./verification');
const webhook = require('./webhook');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
  console.log(`Webhook server is listening at port ${PORT}`)
});

const io = require('socket.io').listen(server);

io.on('connection', (socket) => {
  socket.on('newEvents', (events) => {
    io.emit('newEvents', events)
    console.log(">>> From SOCKET.io: newEvents <<<")
    console.log(JSON.stringify(events, null, 2))
  })
});

app.get('/webhook', verification);
app.post('/webhook', webhook);
