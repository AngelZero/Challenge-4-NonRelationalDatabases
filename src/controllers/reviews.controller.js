import mongoose from 'mongoose';
import { Restaurant } from '../models/restaurant.model.js';
import { Review } from '../models/review.model.js';


/**
 * POST /restaurants/:id/reviews
 * Creates a review for a restaurant (rating 1..5, comment string).
 * Recomputes restaurant.ratingSummary (avg, count).
 */

export async function createReview(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid restaurant id' });
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    const { rating, comment } = req.body;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ error: 'rating(1-5) and comment are required' });
    }

    const review = await Review.create({ restaurantId: id, rating, comment });

    // recompute rating summary for correctness on updates/deletes too
    const agg = await Review.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$restaurantId', count: { $sum: 1 }, avg: { $avg: '$rating' } } }
    ]);
    const { count = 0, avg = 0 } = agg[0] || {};
    await Restaurant.findByIdAndUpdate(id, { $set: { 'ratingSummary.count': count, 'ratingSummary.avg': avg } });

    res.status(201).json(review);
  } catch (e) { next(e); }
}


/**
 * GET /restaurants/:id/reviews
 * Lists reviews for a restaurant (newest first)
 */

export async function listReviewsForRestaurant(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid restaurant id' });
    const items = await Review.find({ restaurantId: id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
}


/**
 * PATCH/PUT /reviews/:reviewId
 * Updates a review; then recomputes ratingSummary for the parent restaurant
 */

export async function updateReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    if (!mongoose.isValidObjectId(reviewId)) return res.status(400).json({ error: 'Invalid review id' });
    const doc = await Review.findByIdAndUpdate(reviewId, req.body || {}, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Review not found' });

    // recompute summary
    const rid = doc.restaurantId.toString();
    const agg = await Review.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(rid) } },
      { $group: { _id: '$restaurantId', count: { $sum: 1 }, avg: { $avg: '$rating' } } }
    ]);
    const { count = 0, avg = 0 } = agg[0] || {};
    await mongoose.model('Restaurant').findByIdAndUpdate(rid, { $set: { 'ratingSummary.count': count, 'ratingSummary.avg': avg } });

    res.json(doc);
  } catch (e) { next(e); }
}

export async function deleteReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    if (!mongoose.isValidObjectId(reviewId)) return res.status(400).json({ error: 'Invalid review id' });
    const doc = await Review.findByIdAndDelete(reviewId);
    if (!doc) return res.status(404).json({ error: 'Review not found' });

    // recompute summary
    const rid = doc.restaurantId.toString();
    const agg = await Review.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(rid) } },
      { $group: { _id: '$restaurantId', count: { $sum: 1 }, avg: { $avg: '$rating' } } }
    ]);
    const { count = 0, avg = 0 } = agg[0] || {};
    await mongoose.model('Restaurant').findByIdAndUpdate(rid, { $set: { 'ratingSummary.count': count, 'ratingSummary.avg': avg } });

    res.status(204).send();
  } catch (e) { next(e); }
}
