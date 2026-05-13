import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// =====================================================
//  LTT API Server - Production Configuration
//  ضع هذا الملف في artifacts/api-server/src/config/
// =====================================================

const isProduction = process.env.NODE_ENV === 'production';

// --- CORS Configuration ---
const allowedOrigins = isProduction
  ? [
      'http://192.168.1.50:20147',
      'http://192.168.1.50:5173',
      'http://localhost:20147',
      'http://localhost:5173',
    ]
  : ['http://localhost:5173', 'http://localhost:20147'];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400,
};

// --- Rate Limiting ---
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.TRUST_PROXY === 'true',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Upload Directory Setup ---
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', '..', '..', 'deployment', 'production', 'uploads');

export function ensureUploadDir(): void {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`[Production] Created upload directory: ${uploadDir}`);
  }

  // Create subdirectories for different document types
  const subDirs = ['photos', 'documents', 'avatars', 'temp'];
  for (const dir of subDirs) {
    const subPath = path.join(uploadDir, dir);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
  }
}

export { uploadDir };

// --- Security Headers ---
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disabled for API (handled by frontend)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// --- Compression ---
export const compressionConfig = {
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
};

// --- Global Error Handler ---
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`[${new Date().toISOString()}] Unhandled Error:`, {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });

  const statusCode = (err as any).statusCode || 500;
  const message = isProduction ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

// --- 404 Handler ---
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
  });
}

// --- Health Check Response ---
export function healthCheckResponse() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    version: process.version,
  };
}

// --- Graceful Shutdown ---
export function setupGracefulShutdown(server: ReturnType<typeof express>) {
  const shutdown = (signal: string) => {
    console.log(`\n[${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`);

    server.close(() => {
      console.log(`[${new Date().toISOString()}] HTTP server closed.`);
      // Close database pool here if needed
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error(`[${new Date().toISOString()}] Forced shutdown after timeout.`);
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Prevent unhandled rejections from crashing
  process.on('unhandledRejection', (reason) => {
    console.error(`[${new Date().toISOString()}] Unhandled Rejection:`, reason);
  });

  process.on('uncaughtException', (err) => {
    console.error(`[${new Date().toISOString()}] Uncaught Exception:`, err);
    process.exit(1);
  });
}

// --- Database Connection Retry ---
export async function connectWithRetry(
  connectFn: () => Promise<void>,
  maxRetries = 10,
  delayMs = 3000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connectFn();
      console.log(`[Production] Database connected successfully on attempt ${attempt}`);
      return;
    } catch (err) {
      console.error(
        `[Production] Database connection attempt ${attempt}/${maxRetries} failed:`,
        (err as Error).message,
      );
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
