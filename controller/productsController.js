import multer from 'multer';
import Product from "../models/products.js";
import { v4 as uuidv4 } from 'uuid';



const storage = multer.diskStorage({
    destination: function (req , file , cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})


export const upload = multer({ 
    storage
});

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); 
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not fetch products' });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Find product by ID
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not fetch product' });
    }
};


// Add new product
export const addProduct = async (req, res) => {
    try {
        const { _id, name, description, price, category, subCategory, sizes, bestseller } = req.body;
        const sizeArray = sizes ? sizes.split(',') : [];
        // const images = req.files.map(file => file.path); 
        const images = req.files.map(file => `/images/${file.filename}`);
        
        const newProduct = new Product({
            _id: uuidv4(),
            name,
            description,
            price,
            category,
            subCategory,
            sizes: sizeArray,
            bestseller: bestseller || false,
            image: images
        });

        const savedProduct = await newProduct.save();
        res.status(201).json({message: 'Product added successfully' , product: savedProduct});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not add product' });
    }
};

// Update product
export const updateProduct = async (req , res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
        const images = req.files ? req.files.map(file => `/images/${file.filename}`) : undefined ;
        const sizeArray = sizes ? sizes.split(',') : [];

        const updatedProduct  = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                category,
                subCategory,
                sizes: sizeArray,
                bestseller: bestseller || false,
                ...(images && {image : images})
            },
            {new  : true}
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(201).json({message: 'Product updated successfully' , productUpdate: updatedProduct});
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not update product' });
    }
    
}

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
    
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not delete product' });
    }
};
