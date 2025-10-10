import { Router } from 'express';
import { createReview, listReviewsForRestaurant } from '../controllers/reviews.controller.js';

const router = Router({ mergeParams: true });

router.post('/', createReview);
router.get('/', listReviewsForRestaurant);

export default router;
