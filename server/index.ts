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

(async () => {
  try {
    // Initialize database and seed users in production
    if (process.env.NODE_ENV === "production") {
      log("Initializing database and seeding users...");
      await seedUsers();
      log("Database initialization completed successfully");
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
    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Start the server and keep the process alive
    new Promise<void>((resolve, reject) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
        log("Server is ready to handle requests");
        // Server is now listening, but don't resolve the promise to keep the process alive
      });

      // Handle server errors
      server.on('error', (error) => {
        log(`Server error: ${error.message}`);
        reject(error);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        log('SIGTERM received, shutting down gracefully');
        server.close(() => {
          log('Process terminated');
          resolve(); // Now resolve to allow the process to exit
        });
      });

      process.on('SIGINT', () => {
        log('SIGINT received, shutting down gracefully');
        server.close(() => {
          log('Process terminated');
          resolve(); // Now resolve to allow the process to exit
        });
      });
    });

    // Keep the process alive with an infinite promise
    await new Promise(() => {
      // This promise never resolves, keeping the process alive
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
