import express from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    activateUserProfile,
    changeUserPassword,
    updateUserProfile,
    getUserDetails,
    deleteUserProfile,
    upload,
} from "../controller/usersController.js";
import { protectRoute } from '../middlewares/authMiddleware.js';

const router  = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/:id', protectRoute, getUserDetails);

// router.put('/:id', upload.array('images', 1) , updateUserProfile);
// router.put("/change-password", changeUserPassword);


// router
//     .route("/:id").put(activateUserProfile).delete(deleteUserProfile);






router.put('/:id', upload.single('image'), updateUserProfile);
router.put("/change-password", protectRoute, changeUserPassword);


router.route("/:id")
    .put(protectRoute, activateUserProfile)
    .delete(protectRoute, deleteUserProfile);

export default router ;