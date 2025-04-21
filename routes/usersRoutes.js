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
import { protectRoute } from "../middlewares/authMiddleware.js";
// import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";
// import { limiter } from "../middlewares/limiterMiddleware.js";

const router  = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/profile' ,protectRoute ,getUserDetails);


router.put('/update', protectRoute ,upload.single('image') ,updateUserProfile);
router.put("/update-password", changeUserPassword);


router.delete("/delete", protectRoute ,deleteUserProfile);

export default router ;