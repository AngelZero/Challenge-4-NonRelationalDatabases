import mongoose from 'mongoose';
import { Restaurant } from '../models/restaurant.model.js';
import { Neighborhood } from '../models/neighborhood.model.js';


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

/**
 * GET /restaurants/search
 * Query params: name (partial), borough, cuisine, zipcode, minRating, maxRating, sort, order, page, limit
 * sort: name|cuisine|createdAt|rating ; order: asc|desc
 */
export async function searchRestaurants(req, res, next) {
  try {
    const { name, borough, cuisine, zipcode, minRating, maxRating, sort, order } = req.query;
    const q = {};

    if (name)    q.name = { $regex: name, $options: 'i' };
    if (borough) q.borough = borough;
    if (cuisine) q.cuisine = cuisine;
    if (zipcode) q['address.zipcode'] = zipcode;

    if (minRating || maxRating) {
      q['ratingSummary.avg'] = {};
      if (minRating) q['ratingSummary.avg'].$gte = Number(minRating);
      if (maxRating) q['ratingSummary.avg'].$lte = Number(maxRating);
    }

    const dir = (order === 'desc') ? -1 : 1;
    const allowed = ['name','cuisine','createdAt','rating'];
    let sortSpec = { createdAt: -1 };
    if (sort && allowed.includes(sort)) {
      sortSpec = (sort === 'rating') ? { 'ratingSummary.avg': dir } : { [sort]: dir };
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Restaurant.find(q).sort(sortSpec).skip(skip).limit(limit),
      Restaurant.countDocuments(q)
    ]);

    res.json({ page, limit, total, items });
  } catch (e) { next(e); }
}

/**
 * GET /restaurants/within?neighborhood=Bedford
 * Uses neighborhoods.geometry.coordinates (no "type" stored) and wraps it as GeoJSON Polygon for $geoWithin.
 */
export async function restaurantsWithinNeighborhood(req, res, next) {
  try {
    const { neighborhood } = req.query;
    if (!neighborhood) return res.status(400).json({ error: 'neighborhood query param is required' });

    const nb = await Neighborhood.findOne({ name: neighborhood });
    if (!nb) return res.status(404).json({ error: 'Neighborhood not found' });

    const polygon = { type: 'Polygon', coordinates: nb.geometry.coordinates };
    const items = await Restaurant.find({
      'address.coord': { $geoWithin: { $geometry: polygon } }
    }).limit(200);

    res.json({ neighborhood, count: items.length, items });
  } catch (e) { next(e); }
}

/**
 * POST /restaurants/within
 * Body: { "coordinates": [[[lon,lat], ...]] }
 * (If you later add "type" in the payload, just ignore it and keep wrapping with type: 'Polygon'.)
 */
export async function restaurantsWithinGeometry(req, res, next) {
  try {
    const { coordinates } = req.body || {};
    if (!coordinates) return res.status(400).json({ error: 'coordinates (GeoJSON Polygon) are required' });

    const polygon = { type: 'Polygon', coordinates };
    const items = await Restaurant.find({
      'address.coord': { $geoWithin: { $geometry: polygon } }
    }).limit(200);

    res.json({ count: items.length, items });
  } catch (e) { next(e); }
}

/**
 * GET /restaurants/near?lng=-73.98&lat=40.7&maxDistanceMeters=2000&limit=20
 * Requires a 2dsphere index on restaurants.address.coord (already defined in your model).
 */
export async function restaurantsNear(req, res, next) {
  try {
    const lng = Number(req.query.lng);
    const lat = Number(req.query.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({ error: 'lng and lat must be numeric' });
    }
    const max = req.query.maxDistanceMeters ? Number(req.query.maxDistanceMeters) : undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 200);

    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          key: 'address.coord',
          distanceField: 'distanceMeters',
          spherical: true,
          ...(Number.isFinite(max) ? { maxDistance: max } : {})
        }
      },
      { $limit: limit }
    ];

    const items = await Restaurant.aggregate(pipeline);
    res.json({ origin: { lng, lat }, count: items.length, items });
  } catch (e) { next(e); }
}
