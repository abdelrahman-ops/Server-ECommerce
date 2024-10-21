import express from "express";
import productRoutes from './productsRoutes.js';
import userRoutes from './usersRoutes.js';

const routes = express.Router();

routes.use('/products', productRoutes);
routes.use('/users', userRoutes);


export default routes