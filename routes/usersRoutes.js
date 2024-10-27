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


router.put('/update', upload.single('image') ,updateUserProfile);
router.put("/change-password", changeUserPassword);


router.delete("/:id", deleteUserProfile);

export default router ;