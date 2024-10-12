import express from "express";
import productRoutes from './productsRoutes.js';
import userRoutes from './usersRoutes.js';

const router = express.Router();

router.use('/products', productRoutes);
router.use('/users', userRoutes);


export default router