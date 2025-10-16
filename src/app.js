import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import restaurantsRouter from './routes/restaurants.routes.js';
import reviewsRouter from './routes/reviews.routes.js';
import restaurantReviewsRouter from './routes/restaurant-reviews.routes.js';

/**
 * Express app setup
 * - Loads env vars
 * - Connects to MongoDB
 * - Registers routes and central error handler
 */


const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// db connect
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI missing in .env');
  process.exit(1);
}
mongoose.connect(uri).then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection error', err); process.exit(1); });

// routes
app.use('/restaurants', restaurantsRouter);
app.use('/reviews', reviewsRouter);
app.use('/restaurants/:id/reviews', restaurantReviewsRouter);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
