import express from 'express';
import "dotenv/config";

import cors from 'cors';
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
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/images', express.static(join(__dirname, 'public/images')));
app.use('/public/images', express.static('public/images'));

app.use('/api', router);

app.use(routeNotFound);
app.use(errorHandler);

// This function will be used by Vercel to handle requests
export default (req, res) => {
    app(req, res);
};
