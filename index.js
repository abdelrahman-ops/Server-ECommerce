import express from 'express';
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from 'cors';
import morgan from "morgan";


import { routeNotFound, errorHandler } from './middlewares/errorMiddleware.js';
import routes from './routes/index.js';
import dbConnection from './config/db.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Establish database connection
dbConnection();

// Create express app instance
const app = express();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



        // Middleware setup
app.use(
    cors({ 
        origin: [
            "http://localhost:5173" , 
            "http://localhost:5174",
            "https://44ever.netlify.app"
        ], 
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Serve static files
app.use('/images', express.static(join(__dirname, 'public/images')));

app.use('/users', express.static(join(__dirname, 'public/users')));

app.use('/api', routes);

// Handle errors
app.use(routeNotFound);
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("Server is up and running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});