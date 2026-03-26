import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connections
import { connectDatabase } from './db/mongoose';
import { connectRedis, disconnectRedis } from './db/redis';

// Skill loading
import { inMemorySkillStore } from './db/in-memory-store';
import { SkillParser } from './skills/SkillParser';

// API routes
import skillsRouter from './api/skills';

// GraphQL
import { applyGraphQLMiddleware } from './graphql/server';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));
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

// API routes
app.use('/api/v1/skills', skillsRouter);

// Status endpoint
app.get('/api/v1/status', (req, res) => {
  res.json({
    version: '1.0.0',
    phase: 'Phase 1 - Core Foundation',
    status: 'active',
    databases: {
      mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured',
      redis: process.env.REDIS_URL ? 'configured' : 'not configured'
    }
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

async function startServer() {
  // Connect to MongoDB (optional, gracefully skip if not available)
  console.log('🔄 Initializing database connections...');
  try {
    await connectDatabase();
  } catch (error) {
    console.warn('⚠️ MongoDB not available, using memory-only mode');
  }

  // Connect to Redis
  try {
    await connectRedis();
  } catch (error) {
    console.warn('⚠️ Redis not available, continuing without caching');
  }

  // Load skills into memory on server startup
  const skillsPath = process.env.SKILLS_PATH || '/home/openclaw/.openclaw/workspace/antigravity-awesome-skills/skills';
  console.log(`\n📂 Loading skills from: ${skillsPath}`);
  try {
    const parser = new SkillParser();
    const skills = await parser.parseSkillsDirectory(skillsPath);
    console.log(`✅ Found ${skills.length} skills`);
    const result = await inMemorySkillStore.saveSkills(skills);
    console.log(`✅ Loaded ${result.saved} skills into memory`);
  } catch (error) {
    console.warn('⚠️ Skills loading failed, starting with empty skill set');
  }

  // Apply GraphQL middleware (disabled until types are fixed)
  // await applyGraphQLMiddleware(app, process.env.GRAPHQL_PATH || '/graphql');

  // Start HTTP server (always start, even if DB connections fail)
  httpServer.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║        Ultimate AI Assistant Server       ║
  ╠══════════════════════════════════════════╣
  ║  Status: 🟢 Running                      ║
  ║  Port:   ${String(PORT).padEnd(31)}║
  ║  Phase:  Phase 1 - Core Foundation       ║
  ║  API:    http://localhost:${PORT}/api/v1      ║
  ║  GraphQL: (disabled: type issues)       ║
  ║  Time:   ${new Date().toLocaleString().padEnd(28)}║
  ╚══════════════════════════════════════════╝
      `);
  });
}

startServer();

export { app, io, httpServer };
