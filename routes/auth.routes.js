import express from "express";
import {
    loginUser,
    registerUser,
    // upload,
    uploadUserImage,
} from '../controller/usersController.js'
import { loginWithGoogle } from "../controller/google.controller.js";



const router  = express.Router();

router.post('/register', uploadUserImage.single('image'), registerUser);
router.post('/login', loginUser);
router.post('/google', loginWithGoogle);




export default router ;