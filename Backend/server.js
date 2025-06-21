import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import router from './Routes/routes.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app); //   wrap Express app with HTTP server

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080', //  Allow your frontend
    methods: ['GET', 'POST']
  }
});

app.use(express.json());               // makes it ez to parse json from POST req        [ middleware ]
app.use(cors());

connectDB();

app.use('/api', router);

//  socket.io logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// make io accessible to routes if needed
app.set('io', io);


server.listen(5000, () => {
  console.log('Server with socket.io running on http://localhost:5000');
});
