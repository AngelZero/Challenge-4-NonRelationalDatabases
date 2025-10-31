import mongoose from 'mongoose';

const NeighborhoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    geometry: {
      coordinates: { type: Array, required: true }
    }
  },
  { collection: 'neighborhoods', versionKey: false }
);

export const Neighborhood = mongoose.model('Neighborhood', NeighborhoodSchema);
