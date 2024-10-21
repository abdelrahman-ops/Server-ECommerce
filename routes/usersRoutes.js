import express from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    changeUserPassword,
    updateUserProfile,
    getUserDetails,
    deleteUserProfile,
    upload,
} from "../controller/usersController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";
import { limiter } from "../middlewares/limiterMiddleware.js";

const router  = express.Router();

router.post('/register', limiter , upload.single('image'), registerUser);
router.post('/login', limiter, loginUser);
router.post('/logout', logoutUser);

router.get('/:id', protectRoute, getUserDetails);


router.put('/:id', protectRoute ,upload.single('image') ,updateUserProfile);
router.put("/change-password", protectRoute, changeUserPassword);


router.delete("/:id" , protectRoute, deleteUserProfile);

export default router ;