const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const winston = require("winston");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const logger = winston.createLogger({
  level: "info", 
  format: winston.format.combine(
    winston.format.colorize(), 
    winston.format.simple() 
  ),
  transports: [
    new winston.transports.Console(), 
    new winston.transports.File({ filename: "app.log" }),
  ],
});

const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 8000;

if (!mongoUri) {
  logger.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Product API",
      version: "1.0.0",
      description: "API documentation for Product Management",
    },
    servers: [{ url: `http://localhost:${port}` }],
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log(swaggerDocs); // This will help you inspect the generated docs


// Connect to MongoDB
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("MongoDB Connection Error:", err));

app.listen(port, () => logger.info(`Server running on port ${port}`));

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  views: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Indexing for better query performance
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });

const Product = mongoose.model("Product", ProductSchema);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added successfully
 */
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    logger.info(`Product added: ${product.name}`);
    res.json(product);
  } catch (error) {
    logger.error("Error adding product:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get products with lazy loading
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *     responses:
 *       200:
 *         description: Fetched products successfully
 */
app.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 10, maxPrice, sort, category } = req.query;
    const query = {};

    // Filtering
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    if (category) {
      query.category = category;
    }

    // Sorting by creation date
    const sortOption = sort === "desc" ? { createdAt: -1 } : { createdAt: 1 };

    // Fetch total products and pages
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch products lazily
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    logger.info(`Fetched ${products.length} products for page ${page}`);
    res.json({ products, totalPages });
  } catch (error) {
    logger.error("Error fetching products:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/categorized:
 *   get:
 *     summary: Get categorized products
 *     responses:
 *       200:
 *         description: Fetched categorized products successfully
 */
app.get("/products/categorized", async (req, res) => {
  try {
    const mostViewed = await Product.find().sort({ views: -1 }).limit(2);
    const mostPopular = await Product.find().sort({ reviews: -1 }).limit(2);
    const mostReviewed = await Product.find().sort({ reviews: -1 }).limit(2);

    logger.info("Fetched categorized products (most viewed, popular, reviewed)");
    res.json({ mostViewed, mostPopular, mostReviewed });
  } catch (error) {
    logger.error("Error fetching categorized products:", error.message);
    res.status(500).json({ error: error.message });
  }
});