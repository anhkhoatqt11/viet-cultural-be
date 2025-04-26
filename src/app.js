const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        connectSrc: ["*"],  // Allow all connection sources
        imgSrc: ["'self'", "data:", "*"],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  })
);

// CORS configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://cutural-vie.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Origin', 
    'X-Requested-With', 
    'Accept'
  ],
  credentials: true,
  optionSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests globally

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Viet Cultural API',
      version: '1.0.0',
      description: 'API documentation for Viet Cultural Backend',
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000/api/v1',
        description: 'Deployed server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token here',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/**/*.js'],
};

swaggerOptions.definition.servers.push({
  url: 'http://localhost:5000/api/v1',
  description: 'Localhost',
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api-docs/swagger-ui-bundle.js", express.static(require.resolve("swagger-ui-dist/swagger-ui-bundle.js")));
app.use("/api-docs/swagger-ui-standalone-preset.js", express.static(require.resolve("swagger-ui-dist/swagger-ui-standalone-preset.js")));
app.use("/api-docs/swagger-ui.css", express.static(require.resolve("swagger-ui-dist/swagger-ui.css")));

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
