import multer from 'multer';
import User from "../models/users.js";
import { createJWT ,clearJWT  } from '../utils/utility.js';
import Joi from 'joi';
import Cart from '../models/cart.js';

const storage = multer.diskStorage({
    destination: function (req , file , cb) {
        cb(null, 'public/users');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})


export const upload = multer({ 
    storage
});

export const registerUser = async (req, res) => {
    // const registerSchema = Joi.object({
    //     email: Joi.string().email().required(),
    //     password: Joi.string().min(6).required(),
    //     username: Joi.string().required(),
    //     number: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
    //         'string.pattern.base': 'Phone number must be between 10 and 15 digits.'
    //     }),
    // });

    try {
        // const { error } = registerSchema.validate(req.body);
        // if (error) {
        //     return res.status(422).json({ message: "Invalid data from server" });
        // }
        const { username, firstName, lastName, number, email, password, isAdmin, dateOfBirth, gender } = req.body;
        
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "User already exists"
            });
        }
        
        const image = req.file ? `/users/${req.file.filename}` : null;
        
        const newUser = new User({
            username,
            firstName,
            lastName,
            number,
            email,
            password, 
            isAdmin,
            dateOfBirth,
            gender,
            image: image,
        });
        
        // console.log('New User Object before saving:', newUser); 
        
        if(newUser) {
            const savedUser = await newUser.save();
            const token = createJWT(res, savedUser._id);
            savedUser.password = undefined; 


            res.status(201).json({
                status: true,
                message: 'server saying : User created successfully',
                data: {
                    user: savedUser,
                    token
                },
            })
        }else{
            return res.status(400).json({ 
                status: false, 
                message: "Invalid user data" 
            });
        }

    } catch (error) {
        // console.log('Error while creating user:', error);
        return res.status(400).json({ status: false, message: error.message });
    }
};


export const loginUser = async (req, res) => {
    const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
    });

    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(422).json({ message: "Invalid data from server" });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password"
            });
        }

        if (user.authMethod === 'google') {
            return res.status(400).json({
                status: false,
                message: "This account was created with Google. Please sign in with Google."
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password"
            });
        }

        const token = createJWT(res, user._id);

        return res.status(200).json({
            status: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    number: user.number,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    image: user.image,
                    authMethod: user.authMethod
                },
                token
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};


// export const updateUserProfile = async (req, res) => {
//     // const updates = req.body;

//     console.log(req.user, "req.user in updateUserProfile controller");
    

//     try {
//         const updatedUser = await User.findByIdAndUpdate(
//             req.user.userId,
//             { $set: updates },
//             { new: true , runValidators: true }
//         );

//         console.log("Inside update controller - req.user:", req.user);

//         if (!updatedUser) {
//             return res.status(404).json({
//                 status: false,
//                 message: "User not found"
//             });
//         }

//         updatedUser.password = undefined;
//         res.status(200).json({
//             status: true,
//             message: "User profile updated successfully",
//             user: updatedUser
//         });
//         console.log('updatedUser', updatedUser) 

//     } catch (error) {
//         console.log("Error updating user profile:",error);
//         return res.status(500).json({
//             status: false,
//             message: "Server error"
//         });
//     }
// };

export const updateUserProfile = async (req, res) => {
    try {
        // Combine regular fields and file information
        const updates = {
            ...req.body,
            ...(req.file && { image: `/users/${req.file.filename}` }) // Adjust path as needed
        };

        console.log('Updating with:', updates);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        updatedUser.password = undefined;
        res.status(200).json({
            status: true,
            message: "User profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        // console.log("Error updating user profile:", error);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
};
export const changeUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Current password is incorrect"
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({
            status: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
};


export const getUserDetails = async (req, res) => {
    // if (!req.user) {
    //     return res.status(401).json({
    //         status: false,
    //         message: "User not authenticated.",
    //     });
    // }
    const { userId } = req.user;
    // console.log(req.user, " user cont req.user");
    // console.log(userId);
    
    try {
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            status: true,
            user
        });
    } catch (error) {
        console.error("Error fetching user details:", error);  // Improved error logging
        return res.status(500).json({
            status: false,
            message: "Server error. Please try again later.",
        });
    }
};


export const logoutUser = async (req, res) => {
    try {
        clearJWT(res);
    
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        // console.log(error);
        return res.status(500).json({ status: false, message: error.message });
    }
};



export const deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.userId);
        // console.log("User deleted:", user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await Cart.deleteMany({ userId: req.user.userId });

        // Optionally cancel orders:
        // await Order.updateMany({ userId: req.user.userId }, { status: 'cancelled' });

        res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting account:", error.message);
        res.status(500).json({
            success: false,
            message: "Error deleting account",
        });
    }
};