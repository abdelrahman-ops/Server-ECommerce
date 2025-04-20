import express from "express";
import productRoutes from './productsRoutes.js';
import userRoutes from './usersRoutes.js';
import cartRoutes from './cartRoutes.js';

const routes = express.Router();

routes.use('/products', productRoutes);
routes.use('/users', userRoutes);
routes.use('/cart', cartRoutes);


export default routes