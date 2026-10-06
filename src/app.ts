import express from 'express';
import { orderRoutes } from './routes/orders.js';
import { createTables, seedData } from './database/database.js';

export const createApp = (): express.Application => {
  createTables();
  seedData();

  const app = express();
  app.use(express.json());

  app.use('/api/orders', orderRoutes);

  return app;
};