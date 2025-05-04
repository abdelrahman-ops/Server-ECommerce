import express from "express";
import productRoutes from './products.routes.js';
import userRoutes from './users.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from "./wishlist.routes.js";
import authRoutes from './auth.routes.js';

const routes = express.Router();

routes.use('/products', productRoutes);
routes.use('/users', userRoutes);
routes.use('/cart', cartRoutes);
routes.use('/wishlist', wishlistRoutes);
routes.use('/auth', authRoutes);


export default routes