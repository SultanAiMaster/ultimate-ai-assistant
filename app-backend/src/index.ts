import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ultimate AI Assistant Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes (to be added in Phase 1)
app.get('/api/v1/status', (req, res) => {
  res.json({
    version: '1.0.0',
    phase: 'Phase 1 - Core Foundation',
    status: 'starting'
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║        Ultimate AI Assistant Server       ║
  ╠══════════════════════════════════════════╣
  ║  Status: 🟢 Running                      ║
  ║  Port: ${PORT}                              ║
  ║  Phase: 1 - Core Foundation              ║
  ║  Time: ${new Date().toLocaleString()}      ║
  ╚══════════════════════════════════════════╝
  `);
});

export { app, io, httpServer };
