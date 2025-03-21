import Cart from '../models/cart.js';
import Product from '../models/products.js'; 
import User from '../models/users.js'; 
import mongoose from 'mongoose';

// Add a product to the cart
export const addProduct = async (req, res) => {
    const userId = req.user.userId; // Extracted from the token
    const { productId, quantity, size, price } = req.body;

    console.log("User ID add cart:", userId); // Debug user ID
    console.log("Request Body:", req.body); // Debug request body

    try {
        // Skip ObjectId validation for now
        if (!productId || typeof productId !== 'string') {
            return res.status(400).json({ success: false, message: 'Product ID is required and must be a string' });
        }

        // Find the user's cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create a new cart if it doesn't exist
            cart = new Cart({
                user: userId, // Include the user field
                products: [],
            });
        }

        // Check if the product already exists in the cart
        const productIndex = cart.products.findIndex(
            (item) => item.productId === productId && item.size === size
        );

        if (productIndex !== -1) {
            // Update quantity if the product already exists
            cart.products[productIndex].quantity += quantity;
        } else {
            // Add new product to the cart
            cart.products.push({ productId, quantity, size, price });
        }

        // Save the updated cart
        await cart.save();

        console.log("Updated Cart:", cart); // Debug updated cart
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error adding to cart:', error); // Log the error
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get the user's cart
export const getCart = async (req, res) => {
    const { userId } = req.user;
    console.log(userId);
    
    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Populate product details manually (since productId is a string)
        const populatedCart = await Promise.all(cart.products.map(async (item) => {
            const product = await Product.findById(item.productId); // Find product by ID
            return {
                ...item.toObject(),
                productDetails: product ? { name: product.name, price: product.price, image: product.image } : null,
            };
        }));

        res.status(200).json({ ...cart.toObject(), products: populatedCart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update the cart
export const updateCart = async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity, size } = req.body;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the product in the cart
        const existingProduct = cart.products.find(
            (item) => item.productId === productId && item.size === size
        );

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
    const userId = req.user.userId;
    const { productId, size } = req.body;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove the product from the cart
        cart.products = cart.products.filter(
            (item) => !(item.productId === productId && item.size === size)
        );

        await cart.save();
        res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Drop the entire cart
export const dropCart = async (req, res) => {
    const userId = req.user.userId;

    try {
        await Cart.deleteOne({ user: userId });
        res.status(200).json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const transferCart = async (req, res) => {
    console.log("Received request body:", req.body);
    const userId = req.user.userId; // Extracted from the token
    const { cartItems } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({ message: "Invalid cartItems format" });
    }

    cartItems.forEach(item => {
        console.log("Processing item:", item);  // ✅ Log each item
    });

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create a new cart if it doesn't exist
            cart = new Cart({
                user: userId,
                products: [],
            });
        }

        // Merge guest cart items with the user's cart
        items.forEach((guestItem) => {
            const existingItem = cart.products.find(
                (item) => item.productId === guestItem.id && item.size === guestItem.size
            );

            if (existingItem) {
                // Update quantity if the item already exists
                existingItem.quantity += guestItem.quantity;
            } else {
                // Add new item to the cart
                cart.products.push({
                    productId: guestItem.id,
                    quantity: guestItem.quantity,
                    size: guestItem.size,
                    price: guestItem.price,
                });
            }
        });

        // Save the updated cart
        await cart.save();

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error transferring cart:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};