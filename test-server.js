// Test server to debug production issues
import express from 'express';

const app = express();
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.status(200).send('Test server is running');
});

const port = parseInt(process.env.PORT || '8080', 10);

const server = app.listen({
  port,
  host: "0.0.0.0",
}, () => {
  console.log(`Test server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Keep process alive
setInterval(() => {
  console.log('Server still alive:', new Date().toISOString());
}, 5000);