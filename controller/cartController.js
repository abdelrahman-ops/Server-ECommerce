import Cart from '../models/cart.js';
import Product from '../models/products.js'; 
import User from '../models/users.js'; 
import mongoose from 'mongoose';

// Add a product to the cart
export const addToCart = async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity = 1, size, price } = req.body;

    const product = await Product.findById(productId);
    // console.log("Found Product:", product); // Debug log
    if (!product) {
        console.error(`Product ${productId} not found in database`);
        return res.status(404).json({ 
            success: false, 
            message: "Product Not Found" 
        });
    }

    // console.log("User ID add cart:", userId); // Debug user ID
    // console.log("Request Body:", req.body); // Debug request body

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success : false , message: 'Product Not Found'});
        }

        // Validate size is available
        if (!product.sizes.includes(size)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid size. Available sizes: ${product.sizes.join(', ')}`
            });
        }

        // Find the user's cart
        let cart = await Cart.findOne({ user: userId }) || 
                    new Cart({ user : userId });

        // Add/update item
        await cart.addItem(productId, size, quantity);

        // Return populated cart
        const populatedCart = await Cart.findByUserId(userId);
        res.status(200).json({ 
            success: true, 
            cart: populatedCart 
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};


// Get cart with populated products
export const getCart = async (req, res) => {
    const { userId } = req.user;
    
    try {
        const cart = await Cart.findByUserId(userId);
        
        if (!cart) {
            return res.status(200).json({ 
                success: true, 
                cart: { items: [], totalQuantity: 0 } 
            });
        }

        res.status(200).json({ 
            success: true, 
            cart: {
                id: cart.id,
                items: cart.items,
                totalQuantity: cart.totalQuantity,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            }
        });
        
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
    const { userId } = req.user;
    const { productId, quantity, size } = req.body;

    try {
        if (quantity < 1 || quantity > 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity must be between 1 and 100' 
            });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        // Find and update item
        const itemIndex = cart.items.findIndex(
            item => item.product.equals(productId) && item.size === size
        );

        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in cart' 
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        res.status(200).json({ 
            success: true, 
            cart: await Cart.findByUserId(userId) 
        });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    const { userId } = req.user;
    const { productId, size } = req.body;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        await cart.removeItem(productId, size);
        res.status(200).json({ 
            success: true, 
            cart: await Cart.findByUserId(userId) 
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Drop the entire cart
export const clearCart = async (req, res) => {
    const { userId } = req.user;

    try {
        await Cart.findOneAndDelete({ user: userId });
        res.status(200).json({ 
            success: true, 
            message: 'Cart cleared successfully' 
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Transfer guest cart to user cart
export const transferGuestCart = async (req, res) => {
    const { userId } = req.user;
    const { guestItems } = req.body;

    try {
        if (!Array.isArray(guestItems)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid cart items format' 
            });
        }

        let cart = await Cart.findOne({ user: userId }) || 
                    new Cart({ user: userId });

        // Validate and transfer items
        for (const item of guestItems) {
            try {
                if (item.productId && item.size && item.quantity) {
                    await cart.addItem(item.productId, item.size, item.quantity);
                }
            } catch (itemError) {
                console.warn('Skipping invalid cart item:', itemError.message);
            }
        }

        await cart.save();
        res.status(200).json({ 
            success: true, 
            cart: await Cart.findByUserId(userId) 
        });

    } catch (error) {
        console.error('Transfer cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};