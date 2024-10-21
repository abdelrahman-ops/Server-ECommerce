import bcrypt from "bcryptjs";
import mongoose from 'mongoose';

const {Schema} = mongoose ;

const userSchema = new Schema({
    username : {type : String , required : true , unique: true},
    firstName : {type : String , required : true},
    lastName : {type : String , required : true},
    number : {type : String},
    email : {type : String , required : true , unique: true},
    password: {type : String , required : true},
    isAdmin: {type: Boolean , default: false}, 
    dateOfBirth: {type: Date},
    gender: {type: String},
    image: {type: String},
},
{ collection: 'Users' },
);

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        return ret;
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model("User", userSchema);
console.log('Using model:', User.collection.collectionName);


export default User;