import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    return NextResponse.json({
      status: health.overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        postgresql: health.postgresql ? 'connected' : 'disconnected',
        redis: health.redis ? 'connected' : 'disconnected'
      },
      environment: {
        node_env: process.env.NODE_ENV,
        postgres_configured: !!process.env.POSTGRES_URL,
        redis_configured: !!process.env.REDIS_URL
      }
    }, {
      status: health.overall ? 200 : 503
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    });
  }
}