import mongoose from 'mongoose';

const {Schema} = mongoose ;


const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                // type: Schema.Types.ObjectId,
                type: String,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            size: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},{ collection: 'cart' }
);

cartSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

const Cart = mongoose.model("Cart", cartSchema);
// console.log('Using model:', Product.collection.collectionName);


export default Cart;