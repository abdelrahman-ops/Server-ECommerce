import express from 'express';
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from 'cors';
import morgan from "morgan";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { routeNotFound, errorHandler } from './middlewares/error.middleware.js';
import routes from './routes/index.js';
import dbConnection from './config/db.js';




// Establish database connection
dbConnection();

// Create express app instance
const app = express();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Lumira E-Commerce APP Documentation',
            version: '1.0.0',
            description: 'API documentation for your backend services',
            contact: {
                name: 'Abdelrahman Ataa',
                email: 'abdelrahmanataa17@gmail.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server',
            },
            {
                url: 'https://server-e-commerce-seven.vercel.app',
                description: 'Production server',
            },
        ],
        components: {
        securitySchemes: {
            bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            },
        },
        },
        security: [{
        bearerAuth: [],
        }],
    },
    apis: [
        './routes/*.js', 
        './routes/**/*.js',
        './models/*.js',
        'swagger/*.yaml'
    ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


// Middleware setup
app.use(
    cors({ 
        origin: [
            "http://localhost:5173" , 
            "http://localhost:5174",
            "https://44ever.netlify.app",
            "https://lumira-seven.vercel.app",
            "https://server-e-commerce-seven.vercel.app",
        ], 
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Basic routes
app.get("/", (req, res) => res.send("Server is up and running"));
app.get("/health", (req, res) => res.send("OK"));

// API routes
app.use('/api', routes);

// Documentation routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Serve static files
app.use('/images', express.static(join(__dirname, 'public/images')));
app.use('/users', express.static(join(__dirname, 'public/users')));

// Handle errors
app.use(routeNotFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});