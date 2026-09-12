import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { redisCache } from './config/redis';
import { initSocketServer } from './socket/socket.server';

async function startServer() {
  await connectDatabase();
  await redisCache.connect();

  const PORT = env.PORT || 5000;
  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(Number(PORT), '127.0.0.1', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Healthcare Accessibility Backend active!`);
    console.log(`📡 Local API Base: http://localhost:${PORT}/api/v1`);
    console.log(`🔌 Socket.IO Server active on port ${PORT}`);
    console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    console.log(`💚 Health Check:  http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

