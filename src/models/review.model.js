import mongoose from 'mongoose';

/**
 * Review model
 * - Linked to a Restaurant via `restaurantId`
 * - `rating` is 1..5
 * - `createdAt` defaults to now
 */


const ReviewSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export const Review = mongoose.model('Review', ReviewSchema);
