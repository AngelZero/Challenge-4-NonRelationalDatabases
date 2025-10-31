import { Router } from 'express';
import {
  createRestaurant,
  listRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurants, 
  restaurantsWithinNeighborhood, 
  restaurantsWithinGeometry, 
  restaurantsNear
} from '../controllers/restaurants.controller.js';

const router = Router();

router.post('/', createRestaurant);
router.get('/', listRestaurants);

// Sprint 3 features:
router.get('/search', searchRestaurants);                 
router.get('/within', restaurantsWithinNeighborhood);     
router.post('/within', restaurantsWithinGeometry);        
router.get('/near', restaurantsNear); 

router.get('/:id', getRestaurant);
router.put('/:id', updateRestaurant);
router.patch('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);
  

export default router;
