import mongoose from 'mongoose';
import { Restaurant } from '../models/restaurant.model.js';


/**
 * POST /restaurants
 * Create a restaurant. Requires: name, borough, cuisine.
 * Optional: address { building, street, zipcode, coord:[lon,lat] }
 */

export async function createRestaurant(req, res, next) {
  try {
    const { name, borough, cuisine, address } = req.body;
    if (!name || !borough || !cuisine) {
      return res.status(400).json({ error: 'name, borough, cuisine are required' });
    }
    const doc = await Restaurant.create({ name, borough, cuisine, address: address || {} });
    res.status(201).json(doc);
  } catch (e) { next(e); }
}

/**
 * GET /restaurants
 * Paginated list: ?page&limit
 */

export async function listRestaurants(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Restaurant.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Restaurant.countDocuments()
    ]);
    res.json({ page, limit, total, items });
  } catch (e) { next(e); }
}

/**
 * GET /restaurants/:id
 * Returns a single restaurant or 404 if not found
 */

export async function getRestaurant(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const doc = await Restaurant.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
}

/**
 * PATCH/PUT /restaurants/:id
 * Updates a restaurant (partial or full). Returns 404 if not found
 */

export async function updateRestaurant(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const doc = await Restaurant.findByIdAndUpdate(id, req.body || {}, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
}

/**
 * DELETE /restaurants/:id
 * Deletes a restaurant. Returns 204 on success, 404 if not found
 */

export async function deleteRestaurant(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const doc = await Restaurant.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) { next(e); }
}
