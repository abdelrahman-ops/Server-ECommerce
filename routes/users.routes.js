import express from "express";
import {
    logoutUser,
    changeUserPassword,
    updateUserProfile,
    getUserDetails,
    deleteUserProfile,
    upload,
} from "../controller/usersController.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
// import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";
// import { limiter } from "../middlewares/limiterMiddleware.js";

const router  = express.Router();

router.get('/profile' ,protectRoute ,getUserDetails);

router.post('/logout', logoutUser);

router.put('/update', protectRoute ,upload.single('image') ,updateUserProfile);
router.put("/update-password", protectRoute, changeUserPassword);


router.delete("/delete", protectRoute ,deleteUserProfile);

export default router ;