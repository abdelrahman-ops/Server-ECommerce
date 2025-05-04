import mongoose from 'mongoose';
const { Schema } = mongoose;

const wishlistItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        validate: {
            validator: async function(productId) {
                const product = await mongoose.model('Product').exists({ _id: productId });
                return product;
            },
            message: 'Product reference does not exist'
        }
    },
    size: {
        type: String,
        default: 'default',
        required: false,
        validate: {
            validator: async function (size) {
            // ALLOW default as a special case
            if (size === 'default') return true;

            const product = await mongoose.model('Product').findById(this.product);
            return product?.sizes?.includes(size);
            },
            message: 'Invalid size for this product',
        },
    },
    addedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, { _id: false });

const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: {
        type: [wishlistItemSchema],
        default: [],
        validate: {
            validator: function(items) {
                const uniqueCombinations = new Set(items.map(item => `${item.product}-${item.size}`));
                return uniqueCombinations.size === items.length;
            },
            message: 'Cannot have duplicate product-size combinations in wishlist'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'Wishlists',
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Update timestamp on save
wishlistSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance
wishlistSchema.index({ user: 1 }, { unique: true });
wishlistSchema.index({ 'items.product': 1 });

// Static method to get wishlist with populated products
wishlistSchema.statics.findByUserId = function(userId) {
    return this.findOne({ user: userId })
        .populate({
            path: 'items.product',
            select: 'name price image sizes category bestseller'
        });
};

// Method to add item to wishlist
wishlistSchema.methods.addItem = async function(productId, size) {
    const existingItem = this.items.find(item => 
        item.product.equals(productId) && item.size === size
    );
    
    if (existingItem) {
        throw new Error('This product-size combination already exists in wishlist');
    }
    
    this.items.push({ product: productId, size });
    return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(productId, size) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => 
        !(item.product.equals(productId) && item.size === size)
    );
    
    if (this.items.length === initialLength) {
        throw new Error('Item not found in wishlist');
    }
    
    return this.save();
};

// Method to move item from wishlist to cart
wishlistSchema.methods.moveToCart = async function(productId, size, quantity = 1) {
    // Find the item in wishlist
    const itemIndex = this.items.findIndex(item => 
        item.product.equals(productId) && item.size === size
    );
    
    if (itemIndex === -1) {
        throw new Error('Item not found in wishlist');
    }
    
    const [item] = this.items.splice(itemIndex, 1);
    await this.save();
    
    // Add to cart
    const Cart = mongoose.model('Cart');
    const cart = await Cart.findOne({ user: this.user }) || new Cart({ user: this.user });
    
    const cartItem = cart.items.find(i => 
        i.product.equals(productId) && i.size === size
    );
    
    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
            size,
            quantity
        });
    }
    
    await cart.save();
    return { wishlist: this, cart };
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;