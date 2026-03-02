// c:\Coding\OpenCafe\cafe-pos\backend\src\middleware\requestLogger.ts
import { randomUUID } from 'node:crypto';
import type { NextFunction, Response } from 'express';
import type { RequestWithId } from '../types/express';

export function requestLogger(req: RequestWithId, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  req.requestId = requestId;
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}

