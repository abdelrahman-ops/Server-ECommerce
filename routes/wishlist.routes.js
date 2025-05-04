import express from 'express';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist
} from '../controller/wishList.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();


// GET /api/wishlist - Get user's wishlist
router.get('/', protectRoute, getWishlist);

// POST /api/wishlist - Add item to wishlist
router.post('/', protectRoute,addToWishlist);

// DELETE /api/wishlist/:productId/:size - Remove item from wishlist
router.delete('/:productId/:size', protectRoute,removeFromWishlist);

// POST /api/wishlist/:productId/:size/move-to-cart - Move item to cart
router.post('/:productId/:size/move-to-cart', protectRoute,moveToCart);

// DELETE /api/wishlist/clear - Clear entire wishlist
router.delete('/clear', protectRoute,clearWishlist);

export default router;