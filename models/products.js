import mongoose from 'mongoose';

const {Schema} = mongoose ;


const productSchema = new Schema({
    _id : {type : Schema.Types.ObjectId , required : true}, 
    name : {type : String , required : true},
    description : {type : String , required : true},
    price : {type : Number , required : true},
    image : [String],
    category: {type : String , required : true},
    subCategory: {type : String , required : true},
    sizes: {type : [String] , required : true},
    date: {type: Date, default: Date.now },
    bestseller: {type: Boolean , default: false}, 
},
{ collection: 'Products' },
);

productSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

const Product = mongoose.model("Product", productSchema);
// console.log('Using model:', Product.collection.collectionName);


export default Product;