import express from 'express';
import "dotenv/config";

import cors from 'cors';
import Joi from "joi";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import router from './routes/index.js';
import { routeNotFound, errorHandler } from './middlewares/errorMiddleware.js';

import dbConnection from './config/db.js';

dbConnection();
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);






// Middleware
app.use(cors({ origin: "http://localhost:5173" , credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(join(__dirname, 'public/images')));
app.use('/public/images', express.static('public/images'));


app.use('/api', router);

app.use(routeNotFound);
app.use(errorHandler);

// const loginSchema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string()
//         .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
// });


// app.post("/api/users/login" , (req, res) => {
//     const { error } = loginSchema.validate(req.body);
//     if (error) {
//         return res.status(422).json({ message: "Invalid data from server" });
//     }
//     res.json({ message: "Login successful server" });
// });



app.get('*', (req,res) => {
    res.send("NOT  VALID  RRRR")
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
