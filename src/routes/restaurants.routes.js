import { Router } from 'express';
import {
  createRestaurant,
  listRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../controllers/restaurants.controller.js';

const router = Router();

router.post('/', createRestaurant);
router.get('/', listRestaurants);
router.get('/:id', getRestaurant);
router.put('/:id', updateRestaurant);
router.patch('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);

export default router;
