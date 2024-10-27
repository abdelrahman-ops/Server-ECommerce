import express from "express";
import {
    addProduct,
    getCart,
    updateCart,
    deleteProduct,
    dropCart
} from "../controller/cartController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router  = express.Router();

router.post('/add', protectRoute ,addProduct);

router.get('/cart', protectRoute ,getCart);

router.put('/update' , protectRoute , updateCart);

router.delete("/delete-one", protectRoute ,deleteProduct);
router.delete("/delete-cart", protectRoute , dropCart);

export default router ;