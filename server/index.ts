import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedUsers } from "./seedUsers";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    // Initialize database and seed users in production
    if (process.env.NODE_ENV === "production") {
      log("Initializing database and seeding users...");
      try {
        await seedUsers();
        log("Database initialization completed successfully");
      } catch (error) {
        log(`Warning: Database seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue anyway - the app should still work even if seeding fails
      }
    }
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      // Don't throw the error to prevent server crash
      log(`Error handled: ${status} - ${message}`);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? '8080' : '5000'), 10);
    
    // Start the server
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      log("Server is ready to handle requests");
      log(`Health check available at http://0.0.0.0:${port}/api/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      log(`Server error: ${error.message}`);
      if (error.message.includes('EADDRINUSE')) {
        log(`Port ${port} is already in use. Exiting...`);
        process.exit(1);
      } else {
        log('Server error occurred but continuing...');
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions to prevent unexpected process termination
    process.on('uncaughtException', (error) => {
      log(`Uncaught Exception: ${error.message}`);
      log('Stack trace: ' + error.stack);
      // In production, we might want to restart the process or handle this differently
      // For now, just log and continue
    });

    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Promise Rejection at: ${promise}, reason: ${reason}`);
      // In production, we might want to restart the process or handle this differently
      // For now, just log and continue
    });

    // Keep the process alive
    setInterval(() => {
      // This interval keeps the process alive and provides periodic health checks
      // No need to do anything here, just prevent the process from exiting
    }, 30000); // Every 30 seconds

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
