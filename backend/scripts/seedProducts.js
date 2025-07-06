const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Modern Living Room Sofa",
    description: "Elegant 3-seater sofa with premium fabric upholstery, perfect for modern living rooms",
    category: "living room",
    style: "modern",
    color: "gray",
    price: 899.99,
    stock: 15,
    available: true,
    tags: ["sofa", "living room", "modern", "comfortable"],
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
  },
  {
    name: "Queen Size Bed Frame",
    description: "Contemporary queen size bed frame with wooden headboard and metal legs",
    category: "bedroom",
    style: "contemporary",
    color: "brown",
    price: 599.99,
    stock: 8,
    available: true,
    tags: ["bed", "bedroom", "queen", "wooden"],
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400"
  },
  {
    name: "Kitchen Dining Table Set",
    description: "4-seater dining table with chairs, perfect for small kitchens and apartments",
    category: "kitchen",
    style: "minimalist",
    color: "white",
    price: 299.99,
    stock: 12,
    available: true,
    tags: ["dining", "kitchen", "table", "chairs"],
    image: "https://images.unsplash.com/photo-1617098907768-60b1c4c0cd6d?w=400"
  },
  {
    name: "Bathroom Vanity Unit",
    description: "Modern bathroom vanity with sink and storage cabinet, includes mirror",
    category: "bathroom",
    style: "modern",
    color: "white",
    price: 449.99,
    stock: 6,
    available: true,
    tags: ["bathroom", "vanity", "sink", "storage"],
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
  },
  {
    name: "Children's Study Desk",
    description: "Adjustable height study desk with storage drawers, perfect for kids",
    category: "child bedroom",
    style: "fun",
    color: "blue",
    price: 199.99,
    stock: 20,
    available: true,
    tags: ["desk", "children", "study", "adjustable"],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
  },
  {
    name: "Accent Armchair",
    description: "Stylish accent chair with velvet upholstery, adds elegance to any room",
    category: "living room",
    style: "luxury",
    color: "navy",
    price: 349.99,
    stock: 10,
    available: true,
    tags: ["chair", "accent", "velvet", "elegant"],
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400"
  },
  {
    name: "Wardrobe Cabinet",
    description: "Large wardrobe with hanging space and shelves, includes mirror door",
    category: "bedroom",
    style: "traditional",
    color: "brown",
    price: 799.99,
    stock: 5,
    available: true,
    tags: ["wardrobe", "storage", "mirror", "bedroom"],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
  },
  {
    name: "Kitchen Island",
    description: "Portable kitchen island with butcher block top and storage shelves",
    category: "kitchen",
    style: "rustic",
    color: "natural",
    price: 599.99,
    stock: 7,
    available: true,
    tags: ["island", "kitchen", "butcher block", "portable"],
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await InventoryItem.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await InventoryItem.insertMany(sampleProducts);
    console.log(`Successfully seeded ${products.length} products`);

    // Display the products
    products.forEach(product => {
      console.log(`- ${product.name}: $${product.price}`);
    });

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedProducts(); 