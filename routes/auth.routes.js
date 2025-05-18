import express from "express";
import {
    loginUser,
    registerUser,
    upload,
} from '../controller/usersController.js'
import { loginWithGoogle } from "../controller/google.controller.js";



const router  = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.post('/google', loginWithGoogle);




export default router ;