require('dotenv').config();
const mongoose = require('mongoose');
const InventoryItem = require('./models/InventoryItem');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Sample products data
const products = [
  // Living Room Furniture
  {
    name: "Modern Leather Sofa",
    category: "sofa",
    style: "modern",
    color: "brown",
    price: 1299.99,
    description: "Comfortable 3-seater leather sofa with elegant design. Perfect for modern living rooms.",
    available: true,
    stock: 15,
    tags: ["leather", "comfortable", "modern", "living room"]
  },
  {
    name: "Glass Coffee Table",
    category: "coffee table",
    style: "contemporary",
    color: "clear",
    price: 349.99,
    description: "Sleek glass coffee table with metal legs. Adds elegance to any living space.",
    available: true,
    stock: 25,
    tags: ["glass", "modern", "elegant", "contemporary"]
  },
  {
    name: "Velvet Armchair",
    category: "armchair",
    style: "luxury",
    color: "navy blue",
    price: 599.99,
    description: "Premium velvet armchair with gold accents. Perfect for reading or relaxing.",
    available: true,
    stock: 12,
    tags: ["velvet", "luxury", "comfortable", "elegant"]
  },
  {
    name: "Wooden TV Stand",
    category: "tv stand",
    style: "rustic",
    color: "walnut",
    price: 449.99,
    description: "Solid wood TV stand with storage compartments. Rustic design with modern functionality.",
    available: true,
    stock: 18,
    tags: ["wood", "rustic", "storage", "functional"]
  },
  {
    name: "Floating Bookshelf",
    category: "bookshelf",
    style: "minimalist",
    color: "white",
    price: 199.99,
    description: "Modern floating bookshelf design. Perfect for displaying books and decor items.",
    available: true,
    stock: 30,
    tags: ["minimalist", "modern", "wall-mounted", "decorative"]
  },
  {
    name: "Floor Lamp with USB Port",
    category: "lamp",
    style: "modern",
    color: "black",
    price: 129.99,
    description: "Adjustable floor lamp with built-in USB charging port. Modern design with practical features.",
    available: true,
    stock: 40,
    tags: ["lighting", "USB", "adjustable", "modern"]
  },
  {
    name: "Persian Area Rug",
    category: "rug",
    style: "traditional",
    color: "multicolor",
    price: 799.99,
    description: "Handwoven Persian rug with intricate patterns. Adds warmth and character to any room.",
    available: true,
    stock: 8,
    tags: ["handwoven", "traditional", "decorative", "premium"]
  },

  // Bedroom Furniture
  {
    name: "King Size Platform Bed",
    category: "bed",
    style: "modern",
    color: "gray",
    price: 899.99,
    description: "Sleek platform bed with built-in storage. Modern design with practical storage solutions.",
    available: true,
    stock: 20,
    tags: ["king size", "storage", "modern", "platform"]
  },
  {
    name: "Wooden Nightstand",
    category: "nightstand",
    style: "scandinavian",
    color: "oak",
    price: 249.99,
    description: "Minimalist wooden nightstand with drawer. Scandinavian design with clean lines.",
    available: true,
    stock: 35,
    tags: ["wood", "scandinavian", "minimalist", "storage"]
  },
  {
    name: "6-Drawer Dresser",
    category: "dresser",
    style: "traditional",
    color: "white",
    price: 649.99,
    description: "Spacious 6-drawer dresser with mirror. Traditional design with ample storage space.",
    available: true,
    stock: 15,
    tags: ["storage", "traditional", "mirror", "spacious"]
  },
  {
    name: "Full Length Mirror",
    category: "mirror",
    style: "modern",
    color: "gold",
    price: 179.99,
    description: "Elegant full-length mirror with gold frame. Perfect for bedrooms and dressing areas.",
    available: true,
    stock: 28,
    tags: ["mirror", "full-length", "gold", "elegant"]
  },

  // Kitchen Furniture
  {
    name: "Modern Kitchen Cabinet Set",
    category: "kitchen cabinet",
    style: "modern",
    color: "white",
    price: 2499.99,
    description: "Complete kitchen cabinet set with soft-close doors. Modern design with premium hardware.",
    available: true,
    stock: 5,
    tags: ["kitchen", "cabinets", "modern", "premium"]
  },
  {
    name: "Stainless Steel Refrigerator",
    category: "refrigerator",
    style: "modern",
    color: "stainless steel",
    price: 1899.99,
    description: "Energy-efficient 25 cu. ft. refrigerator with French doors. Modern stainless steel design.",
    available: true,
    stock: 10,
    tags: ["appliance", "energy-efficient", "stainless steel", "large capacity"]
  },
  {
    name: "Gas Range with Oven",
    category: "stove",
    style: "modern",
    color: "stainless steel",
    price: 1299.99,
    description: "Professional 5-burner gas range with convection oven. Perfect for serious cooking.",
    available: true,
    stock: 8,
    tags: ["appliance", "gas", "professional", "convection"]
  },
  {
    name: "Farmhouse Kitchen Sink",
    category: "sink",
    style: "farmhouse",
    color: "white",
    price: 449.99,
    description: "Deep farmhouse sink with single basin. Classic design with modern functionality.",
    available: true,
    stock: 22,
    tags: ["farmhouse", "deep", "classic", "durable"]
  },
  {
    name: "Extendable Dining Table",
    category: "dining table",
    style: "rustic",
    color: "brown",
    price: 799.99,
    description: "Solid wood extendable dining table. Seats 6-10 people. Rustic farmhouse style.",
    available: true,
    stock: 12,
    tags: ["extendable", "wood", "rustic", "large"]
  },
  {
    name: "Upholstered Dining Chairs (Set of 4)",
    category: "chair",
    style: "modern",
    color: "gray",
    price: 399.99,
    description: "Comfortable upholstered dining chairs. Set of 4 with modern design and comfortable seating.",
    available: true,
    stock: 15,
    tags: ["set", "upholstered", "comfortable", "modern"]
  },

  // Bathroom Furniture
  {
    name: "Modern Toilet with Bidet",
    category: "toilet",
    style: "modern",
    color: "white",
    price: 599.99,
    description: "Smart toilet with built-in bidet and heated seat. Modern bathroom technology.",
    available: true,
    stock: 18,
    tags: ["smart", "bidet", "modern", "technology"]
  },
  {
    name: "Freestanding Bathtub",
    category: "bathtub",
    style: "luxury",
    color: "white",
    price: 1299.99,
    description: "Elegant freestanding bathtub. Perfect centerpiece for luxury bathrooms.",
    available: true,
    stock: 6,
    tags: ["freestanding", "luxury", "elegant", "spacious"]
  },
  {
    name: "Rain Shower System",
    category: "shower",
    style: "modern",
    color: "chrome",
    price: 449.99,
    description: "Premium rain shower system with multiple settings. Luxury shower experience.",
    available: true,
    stock: 20,
    tags: ["rain shower", "premium", "multiple settings", "luxury"]
  },
  {
    name: "Wall-Mounted Towel Rack",
    category: "towel rack",
    style: "modern",
    color: "chrome",
    price: 79.99,
    description: "Space-saving wall-mounted towel rack. Modern design with multiple bars.",
    available: true,
    stock: 45,
    tags: ["wall-mounted", "space-saving", "modern", "functional"]
  },

  // Child Bedroom
  {
    name: "Twin Size Bunk Bed",
    category: "bed",
    style: "modern",
    color: "white",
    price: 599.99,
    description: "Safe and sturdy twin-size bunk bed. Perfect for shared children's rooms.",
    available: true,
    stock: 14,
    tags: ["bunk bed", "twin", "safe", "space-saving"]
  },
  {
    name: "Colorful Kids Dresser",
    category: "dresser",
    style: "playful",
    color: "multicolor",
    price: 349.99,
    description: "Fun and colorful dresser for kids. Durable construction with playful design.",
    available: true,
    stock: 16,
    tags: ["kids", "colorful", "durable", "playful"]
  },
  {
    name: "Study Desk for Kids",
    category: "coffee table",
    style: "modern",
    color: "blue",
    price: 199.99,
    description: "Ergonomic study desk designed for children. Adjustable height and storage compartments.",
    available: true,
    stock: 25,
    tags: ["study", "kids", "ergonomic", "adjustable"]
  }
];

// Seed function
const seedProducts = async () => {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await connectDB();
    
    // Clear existing products (optional - comment out if you want to keep existing)
    const deleteResult = await InventoryItem.deleteMany({});
    logger.info(`Cleared ${deleteResult.deletedCount} existing products`);
    
    // Insert products
    logger.info('Seeding products...');
    const insertedProducts = await InventoryItem.insertMany(products);
    logger.info(`✅ Successfully seeded ${insertedProducts.length} products!`);
    
    // Display summary
    const categories = {};
    insertedProducts.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`${category}: ${count} products`);
    });
    console.log(`\nTotal: ${insertedProducts.length} products seeded`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding products:', error);
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
};

// Run seed function
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;

