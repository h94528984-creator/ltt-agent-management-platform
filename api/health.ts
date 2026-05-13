// =====================================================
//  LTT API - Standalone Health Check Endpoint
//  Vercel Serverless Function
// =====================================================
//  هذا الملف يمكن استخدامه كنقطة تحقق مستقلة
//  http://localhost:3000/api/health
// =====================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LTT Agent Management Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    vercel: !!process.env.VERCEL,
    region: process.env.VERCEL_REGION || 'local',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    cors: {
      origins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
    },
    uptime: process.uptime(),
  });
}
