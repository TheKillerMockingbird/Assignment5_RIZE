const { body, validationResult } = require('express-validator');

// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Custom logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.log("----- Incoming Request -----");
  console.log(`Time: ${timestamp}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);

  // Only log body for POST and PUT
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body:", req.body);
  }

  console.log("----------------------------\n");

  next(); // Move to next middleware/route
});

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Validation middleware for menu items
const validateMenuItem = [
  body('name')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  body('description')
    .isString().withMessage('Description must be a string')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  body('price')
    .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),

  body('category')
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be appetizer, entree, dessert, or beverage'),

  body('ingredients')
    .isArray({ min: 1 }).withMessage('Ingredients must be an array with at least 1 item'),

  body('available')
    .optional()
    .isBoolean().withMessage('Available must be a boolean'),

  // Final validation check middleware
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    next();
  }
];

// Define routes and implement middleware here

app.get('/', (req, res) => {
  res.send("Restaurant API is running!");
});

// GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// GET /api/menu/:id - Retrieve a specific menu item
app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(item => item.id === id);

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  res.json(item);
});

// POST /api/menu - Add a new menu item
app.post('/api/menu', validateMenuItem, (req, res) => {
  const newItem = req.body;

  if (!newItem.name || !newItem.price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  newItem.id = menuItems.length + 1;
  menuItems.push(newItem);

  res.status(201).json(newItem);
});

// PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', validateMenuItem, (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(item => item.id === id);

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  const { name, description, price, category, ingredients, available } = req.body;

  if (name) item.name = name;
  if (description) item.description = description;
  if (price) item.price = price;
  if (category) item.category = category;
  if (ingredients) item.ingredients = ingredients;
  if (available !== undefined) item.available = available;

  res.json(item);
});

// DELETE /api/menu/:id - Remove a menu item
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = menuItems.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  const deletedItem = menuItems.splice(index, 1);
  res.json({ message: "Item deleted", item: deletedItem[0] });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});