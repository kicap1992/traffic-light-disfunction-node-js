const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const socket = require('./socket');
const app = express();
const server = http.createServer(app);
const io = socket.init(server);
const iosend = socket.getIO();


dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload());
app.options('*', cors());
app.use(cors());

function isValidDate(dateString) {
  // Check if the string matches the format YYYY-MM-DD using a regular expression
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // Parse the string to a Date object
  const date = new Date(dateString);

  // Check if the date is valid by comparing it with the components of the original string
  const timestamp = date.getTime();
  if (isNaN(timestamp)) {
    return false;
  }

  // Further check to ensure that the date components match the input string
  const [year, month, day] = dateString.split('-').map(Number);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    return false;
  }

  return true;
}

function timeStringToDate(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

// Handle POST requests to '/post'
app.post('/', async (req, res) => {
  // Access the POST data sent in the request body
  try {
    var postData = req.body;
    // console.log(postData);
    const {no ,light ,value2 ,pln } = postData;
    console.log(no ,light ,value2 ,pln);
    // rms = value2
    iosend.emit('datanya',  {
      no : no,
      light : light,
      pln : pln,
      rms : value2});
  
    return res.status(200).send({ message: 'OK data' });
  
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error' });
  }
  
});

app.get('/', async (req, res) => {
  return res.status(200).send({ message: 'This is a GET request' });

})

// app error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Something broke!');
});

io.on('connection', (socket) => {
  let userID = socket.id;
  console.log('A user connected: ' + userID);

  socket.on('scan_dia', (data) => {
    console.log('Received scan_dia event: ' + data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + userID);
  });
});

module.exports = {
  app,
  server,
  io
};

const port = process.env.PORT || 3004;

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
