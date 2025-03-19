import express from 'express';
import {
  getFeaturedProducts,
  getSpecialOffers,
  addFeatured,
  updateFeatured,
  deleteFeatured
} from '../Controllers/featured.controller.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/home/featured', getFeaturedProducts);
router.get('/home/special-offers', getSpecialOffers);

// Protected admin routes
router.post('/admin/featured', protect, admin, addFeatured);
router.put('/admin/featured/:id', protect, admin, updateFeatured);
router.delete('/admin/featured/:id', protect, admin, deleteFeatured);

export default router; 