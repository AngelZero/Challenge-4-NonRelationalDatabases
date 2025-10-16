import { Router } from 'express';
import { updateReview, deleteReview } from '../controllers/reviews.controller.js';

const router = Router();

router.put('/:reviewId', updateReview);
router.patch('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

export default router;
