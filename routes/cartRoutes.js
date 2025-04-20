import express from "express";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    transferGuestCart
} from "../controller/cartController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router  = express.Router();

router.get('/get-cart', protectRoute ,getCart);

router.post('/add-item', protectRoute ,addToCart);
router.post('/transfer-guest', protectRoute ,transferGuestCart);

router.put('/update-item' , protectRoute , updateCartItem);

router.delete("/remove-item", protectRoute ,removeFromCart);
router.delete("/clear-cart", protectRoute , clearCart);

export default router ;