import express from "express";


import { 
    getAllProducts , 
    getProductById , 
    addProduct,
    updateProduct,
    deleteProduct,
    // upload,
    uploadProductImages
} from "../controller/productsController.js";
import { isAdminRoute, protectRoute } from "../middlewares/auth.middleware.js";


const ProductRouter = express.Router()



// Products Routes
ProductRouter.get('/', getAllProducts);                                 //  get all products
ProductRouter.get('/:id', getProductById);                              //  get product by id

ProductRouter.post("/add",  uploadProductImages.array('images', 4) , addProduct);    // add new product

ProductRouter.put('/:id' , uploadProductImages.array('images', 4) ,updateProduct)     //  update product data

ProductRouter.delete('/:id', deleteProduct)                             //  delete a product



export default ProductRouter;