import mongoose from 'mongoose';
import Featured from '../models/model.featured.js';
import Product from '../models/model.product.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '../../.env') });

const seedFeaturedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log('Connected to MongoDB');

    // Get some products to feature
    const products = await Product.find().limit(10);
    
    if (!products.length) {
      console.log('No products found to feature');
      process.exit(1);
    }

    // Clear existing featured products
    await Featured.deleteMany({});
    console.log('Cleared existing featured products');

    // Create featured products
    const featuredProducts = await Promise.all(
      products.slice(0, 5).map(async (product) => {
        return await Featured.create({
          productId: product._id,
          type: 'featured',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          discount: Math.floor(Math.random() * 20), // Random discount between 0-20%
          description: `Featured: ${product.name}`,
          priority: Math.floor(Math.random() * 5),
          isActive: true
        });
      })
    );
    console.log(`Created ${featuredProducts.length} featured products`);

    // Create special offers
    const specialOffers = await Promise.all(
      products.slice(5, 9).map(async (product) => {
        return await Featured.create({
          productId: product._id,
          type: 'special_offer',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          discount: Math.floor(Math.random() * 30) + 20, // Random discount between 20-50%
          description: `Special Offer: ${product.name}`,
          priority: Math.floor(Math.random() * 5),
          isActive: true
        });
      })
    );
    console.log(`Created ${specialOffers.length} special offers`);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding featured products:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedFeaturedProducts();