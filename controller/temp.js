// import { getProducts , setProducts  } from "../models/product.js";
// import { v4 as uuidv4 } from 'uuid';
// import multer from 'multer';
// import Product from "../models/products.js";


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
export const getAllProducts = (req, res) => {
    res.json(getProducts());
};

// Get product by ID
export const getProductById = (req, res) => {
    const product = getProducts().find(p => p._id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// Add new product
export const addProduct = (req , res) => {
    // const newProduct = {_id: Date.now().toString(), ...req.body };
    try {
        const { name, description, category, subCategory, price, sizes, bestseller } = req.body;
        const sizeArray = sizes ? sizes.split(',') : [];
        const images = req.files.map(file => `/images/${file.filename}`);

        const newProduct = {
            _id: uuidv4(),
            name,
            description,
            category,
            subCategory,
            price,
            sizes: sizeArray,
            bestseller: bestseller === 'on',
            images,
        };
        
        const products = getProducts();
        products.push(newProduct);
        setProducts(products);
        
        res.status(201).json({ message: 'server saying : product added successfully', product: newProduct });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
    
    
    
}

// Update product
export const updateProduct = (req , res) => {

    try{
        const products = getProducts();
        const index = products.findIndex(p => p._id === req.params.id);
        if (index !== -1) {
            const images = req.files?.map(file => `/images/${file.filename}`) || products[index].images;
            products[index] = {
                ...products[index],
                ...req.body,
                images
            };
            setProducts(products);
            res.json(products[index]);
        }
        else {
            res.status(404).json({ message : 'product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
    
}

// Delete product
export const deleteProduct = (req , res) => {
    try {
        const products = getProducts();
        const updatedProducts = products.filter(p => p._id !== req.params.id);

        if (updatedProducts.length < products.length) {
            setProducts(updatedProducts);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
}