import mongoose from 'mongoose';

/**
 * Restaurant model
 * - `address.coord` is a coordinate pair [lon, lat]
 * - 2dsphere index on `address.coord` enables geospatial queries in later sprints
 * - `ratingSummary` keeps { avg, count } updated when reviews change
 */


const AddressSchema = new mongoose.Schema({
  building: String,
  street: String,
  zipcode: String,
  coord: {
    type: [Number],
    validate: {
      validator: v => !v || (Array.isArray(v) && v.length === 2),
      message: 'coord must be [lon, lat]'
    }
  }
}, { _id: false });

const RatingSummarySchema = new mongoose.Schema({
  avg: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
}, { _id: false });

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  borough: { type: String, required: true, trim: true },
  cuisine: { type: String, required: true, trim: true },
  address: { type: AddressSchema, default: {} },
  ratingSummary: { type: RatingSummarySchema, default: () => ({}) }
}, { timestamps: true });

RestaurantSchema.index({ 'address.coord': '2dsphere' });

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
