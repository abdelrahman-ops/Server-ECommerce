import express from "express";
// import {isAdminRoute, protectRoute } from "../middleware/authMiddlewares.js"

import { 
    getAllProducts , 
    getProductById , 
    addProduct,
    updateProduct,
    deleteProduct,
    upload
} from "../controller/productsController.js";


const ProductRouter = express.Router()



// Products Routes
ProductRouter.get('/', getAllProducts);                                 //  get all products
ProductRouter.get('/:id', getProductById);                              //  get product by id

ProductRouter.post("/add", upload.array('images' , 4) , addProduct);    // add new product

ProductRouter.put('/:id', upload.array('images', 4) ,updateProduct)     //  update product data

ProductRouter.delete('/:id', deleteProduct)                             //  delete a product



export default ProductRouter;