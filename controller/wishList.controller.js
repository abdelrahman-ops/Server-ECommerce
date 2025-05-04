import Wishlist from '../models/wishList.js';
import Cart from '../models/cart.js';
import Product from '../models/products.js';

// Get user's wishlist
export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findByUserId(req.user.userId);
        
        if (!wishlist) {
            return res.status(200).json({ 
                success: true,
                data: { items: [] } 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: wishlist 
        });
    } catch (error) {
        next(error);
    }
};

// Add item to wishlist
export const addToWishlist = async (req, res, next) => {
    try {
        const { productId, size } = req.body;
        
        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        console.log('addToWishlist body:', req.body);
        
        // Validate size is available
        if (size !== 'default' && !product.sizes.includes(size)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid size for this product' 
            });
        }
        
        let wishlist = await Wishlist.findOne({ user: req.user.userId });
        
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.userId });
        }
        
        await wishlist.addItem(productId, size);
        const populatedWishlist = await Wishlist.findByUserId(req.user.userId);
        
        res.status(200).json({ 
            success: true, 
            data: populatedWishlist 
        });
    } catch (error) {
        next(error);
    }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId, size } = req.params;
        
        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        
        if (!wishlist) {
            return res.status(404).json({ 
                success: false, 
                message: 'Wishlist not found' 
            });
        }
        
        await wishlist.removeItem(productId, size);
        const populatedWishlist = await Wishlist.findByUserId(req.user.userId);
        
        res.status(200).json({ 
            success: true, 
            data: populatedWishlist 
        });
    } catch (error) {
        next(error);
    }
};

// Move item from wishlist to cart
export const moveToCart = async (req, res, next) => {
    try {
        const { productId, size } = req.params;
        const { quantity } = req.body;
        
        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        
        if (!wishlist) {
            return res.status(404).json({ 
                success: false, 
                message: 'Wishlist not found' 
            });
        }
        
        const result = await wishlist.moveToCart(productId, size, quantity);
        
        res.status(200).json({ 
            success: true, 
            data: {
                wishlist: await Wishlist.findByUserId(req.user.userId),
                cart: await Cart.findByUserId(req.user.userId)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Clear entire wishlist
export const clearWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        
        if (!wishlist) {
            return res.status(404).json({ 
                success: false, 
                message: 'Wishlist not found' 
            });
        }
        
        wishlist.items = [];
        await wishlist.save();
        
        res.status(200).json({ 
            success: true, 
            data: { items: [] } 
        });
    } catch (error) {
        next(error);
    }
};