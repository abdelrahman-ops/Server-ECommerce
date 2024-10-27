import Cart from '../models/cart.js';
import Product from '../models/products.js'; 
import User from '../models/users.js'; 

// Add a product to the cart
export const addProduct = async (req, res) => {
    const { productId, quantity, size } = req.body;
    const userId = req.user._id;

    try {
        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the user's cart or create a new one
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, products: [] });
        }

        // Check if the product already exists in the cart
        const existingProduct = cart.products.find(item => item.productId.toString() === productId && item.size === size);
        if (existingProduct) {
            // Update quantity if product already exists in the cart
            existingProduct.quantity += quantity;
        } else {
            // Add new product to cart
            cart.products.push({ productId, quantity, size });
        }

        // Save the cart
        await cart.save();
        res.status(200).json({ message: 'Product added to cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get the user's cart
export const getCart = async (req, res) => {
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('products.productId', 'name price image'); // Populate product details
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update the cart
export const updateCart = async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity, size } = req.body;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const existingProduct = cart.products.find(item => item.productId.toString() === productId && item.size === size);
        if (existingProduct) {
            existingProduct.quantity = quantity; // Update the quantity
            await cart.save();
            return res.status(200).json({ message: 'Cart updated', cart });
        }

        res.status(404).json({ message: 'Product not found in cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a single product from the cart
export const deleteProduct = async (req, res) => {
    const userId = req.user._id;
    const { productId, size } = req.body;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.products = cart.products.filter(item => !(item.productId.toString() === productId && item.size === size));
        await cart.save();
        res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Drop the entire cart
export const dropCart = async (req, res) => {
    const userId = req.user._id;

    try {
        await Cart.deleteOne({ user: userId });
        res.status(200).json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
