import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase, disconnectDatabase } from './db/mongoose';
import skillsRouter from './api/skills';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Ultimate AI Assistant API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    phase: 'Phase 1 - Core Foundation'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Ultimate AI Assistant',
    description: 'World\'s most powerful AI assistant - Self-configuring, 1,226+ skills, unlimited execution',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      skills: '/api/v1/skills',
      categories: '/api/v1/skills/categories',
      riskLevels: '/api/v1/skills/risk-levels',
      tags: '/api/v1/skills/tags'
    },
    github: 'https://github.com/SultanAiMaster/ultimate-ai-assistant'
  });
});

// API routes
app.use('/api/v1/skills', skillsRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    await disconnectDatabase();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`
  ╔═════════════════════════════════════════════╗
  ║   🎭 ULTIMATE AI ASSISTANT API 🎭            ║
  ╠═════════════════════════════════════════════╣
  ║   Status: ✅ Running                          ║
  ║   Port: ${PORT.toString()}                                    ║
  ║   Env: ${process.env.NODE_ENV || 'development'}                           ║
  ║   Phase: Phase 1 - Core Foundation        ║
  ║   Database: ✅ Connected                     ║
  ║   Skills: 1,226 loaded                       ║
  ╠═════════════════════════════════════════════╣
  ║   Health: http://localhost:${PORT}/health           ║
  ║   Skills: http://localhost:${PORT}/api/v1/skills       ║
  ║   Stats: http://localhost:${PORT}/api/v1/skills/stats/metadata  ║
  ╠═════════════════════════════════════════════╣
  ║   Ready for development! 🚀                  ║
  ╚═════════════════════════════════════════════╝
      `);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
