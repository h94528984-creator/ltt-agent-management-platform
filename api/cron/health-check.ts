// =====================================================
//  LTT API - Cron Health Check (Vercel Cron Jobs)
//  https://vercel.com/docs/cron-jobs
// =====================================================
//  يتعامل مع الطلبات من Vercel Cron Jobs
//  للتأكد من أن الخدمة لا تدخل في حالة خمول
// =====================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // التحقق من أن الطلب من Vercel Cron
  const isCron = req.headers['x-vercel-cron'] === 'true';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cron: isCron,
    message: isCron
      ? 'Health check cron executed successfully'
      : 'Manual health check',
    uptime: process.uptime(),
  });
}
