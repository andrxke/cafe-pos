// c:\Coding\OpenCafe\cafe-pos\backend\src\app.ts
import dotenv from 'dotenv';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import analyticsRoutes from './routes/analyticsRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config({ path: '../.env' });
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((entry) => entry.trim()) ?? '*',
  }),
);
app.use(express.json());
app.use(requestLogger);

// Keep HTTP transport registration separate so websocket support can be added later.
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok' } });
});
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use((error: Error, req: Request, res: Response, next: NextFunction) =>
  errorHandler(error, req, res, next),
);

export default app;
