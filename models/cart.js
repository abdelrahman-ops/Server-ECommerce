import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartItemSchema = new Schema({
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
    quantity: {
        type: Number, 
        required: true,
        min: [1, 'Quantity must be at least 1'],
        max: [100, 'Quantity cannot exceed 100']
    },
    size: {
        type: String,
        required: true,
        validate: {
            validator: async function(size) {
                const product = await mongoose.model('Product').findById(this.product);
                return product?.sizes?.includes(size);
            },
            message: 'Invalid size for this product'
        }
    }
}, { _id: false });

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: {
        type: [cartItemSchema],
        default: [],
        validate: {
            validator: function(items) {
                const uniqueCombinations = new Set(items.map(item => `${item.product}-${item.size}`));
                return uniqueCombinations.size === items.length;
            },
            message: 'Cannot have duplicate product-size combinations'
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
    collection: 'Carts',
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
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance
cartSchema.index({ user: 1 }, { unique: true });
cartSchema.index({ 'items.product': 1 });

// Virtual for total quantity
cartSchema.virtual('totalQuantity').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Static method to get cart with populated products
cartSchema.statics.findByUserId = function(userId) {
    return this.findOne({ user: userId })
        .populate({
            path: 'items.product',
            select: 'name price image sizes'
        });
};

// Instance method to add item to cart
cartSchema.methods.addItem = async function(productId, size, quantity = 1) {
    const existingItem = this.items.find(item => 
        item.product.equals(productId) && item.size === size
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ product: productId, size, quantity });
    }

    return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(productId, size) {
    this.items = this.items.filter(item => 
        !(item.product.equals(productId) && item.size === size)
    );
    return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);
console.log('Using model:', Cart.collection.collectionName);

export default Cart;