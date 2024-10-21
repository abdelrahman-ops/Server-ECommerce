import express from "express";


import { 
    getAllProducts , 
    getProductById , 
    addProduct,
    updateProduct,
    deleteProduct,
    upload
} from "../controller/productsController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";


const ProductRouter = express.Router()



// Products Routes
ProductRouter.get('/', getAllProducts);                                 //  get all products
ProductRouter.get('/:id', getProductById);                              //  get product by id

ProductRouter.post("/add", protectRoute , isAdminRoute ,upload.array('images' , 4) , addProduct);    // add new product

ProductRouter.put('/:id', protectRoute , isAdminRoute ,upload.array('images', 4) ,updateProduct)     //  update product data

ProductRouter.delete('/:id', protectRoute , isAdminRoute , deleteProduct)                             //  delete a product



export default ProductRouter;