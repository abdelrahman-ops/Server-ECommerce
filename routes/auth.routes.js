import express from "express";
import {
    loginUser,
    registerUser,
    upload,
} from '../controller/usersController.js'



const router  = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);




export default router ;