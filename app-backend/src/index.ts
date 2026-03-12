import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    description: 'World\'s most powerful AI assistant - Self-configuring, 1200+ skills, unlimited execution',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/docs'
    },
    github: 'https://github.com/SultanAiMaster/ultimate-ai-assistant'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═════════════════════════════════════════════╗
  ║   🎭 ULTIMATE AI ASSISTANT API 🎭            ║
  ╠═════════════════════════════════════════════╣
  ║   Status: ✅ Running                          ║
  ║   Port: ${PORT.toString()}                                    ║
  ║   Env: ${process.env.NODE_ENV || 'development'}                           ║
  ║   Phase: Phase 1 - Core Foundation        ║
  ╠═════════════════════════════════════════════╣
  ║   Health: http://localhost:${PORT}/health           ║
  ║   API: http://localhost:${PORT}/api/v1              ║
  ╠═════════════════════════════════════════════╣
  ║   Ready for development! 🚀                  ║
  ╚═════════════════════════════════════════════╝
  `);
});

export default app;
