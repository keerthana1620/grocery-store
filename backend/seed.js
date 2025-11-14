const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/database');
require('dotenv').config();

connectDB();

const sampleProducts = [
    {
        name: "Fresh Apples",
        description: "Fresh and crispy red apples, rich in fiber and vitamins",
        price: 120,
        originalPrice: 150,
        category: "Fruits",
        image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300",
        inStock: true,
        quantity: 50,
        unit: "kg"
    },
    {
        name: "Bananas",
        description: "Fresh yellow bananas, perfect for smoothies and snacks",
        price: 40,
        category: "Fruits",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300",
        inStock: true,
        quantity: 100,
        unit: "dozen"
    },
    {
        name: "Carrots",
        description: "Organic fresh carrots, great for cooking and salads",
        price: 60,
        originalPrice: 80,
        category: "Vegetables",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300",
        inStock: true,
        quantity: 75,
        unit: "kg"
    },
    {
    name: "Broccoli",
    description: "Fresh green broccoli, packed with nutrients",
    price: 80,
    category: "Vegetables",
    image: "https://plus.unsplash.com/premium_photo-1663858367004-1b6d8c8f0c3c?w=300&auto=format&fit=crop",
    inStock: true,
    quantity: 30,
    unit: "piece"
},
    {
        name: "Milk",
        description: "Fresh full cream milk, 1 liter tetra pack",
        price: 65,
        category: "Dairy",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300",
        inStock: true,
        quantity: 40,
        unit: "liter"
    },
    {
        name: "Eggs",
        description: "Farm fresh eggs, pack of 12",
        price: 90,
        originalPrice: 110,
        category: "Dairy",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300",
        inStock: true,
        quantity: 60,
        unit: "dozen"
    },
    {
        name: "Brown Bread",
        description: "Whole wheat brown bread, 400g packet",
        price: 45,
        category: "Bakery",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300",
        inStock: true,
        quantity: 25,
        unit: "packet"
    },
    {
        name: "Cookies",
        description: "Chocolate chip cookies, 200g pack",
        price: 75,
        originalPrice: 90,
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300",
        inStock: true,
        quantity: 80,
        unit: "pack"
    },
    {
        name: "Basmati Rice",
        description: "Premium quality basmati rice, 1kg pack",
        price: 120,
        category: "Grains",
        image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=300&fit=crop",
        quantity: 45,
        unit: "kg"
    },
    {
        name: "Chicken Breast",
        description: "Fresh chicken breast, 500g pack",
        price: 220,
        originalPrice: 250,
        category: "Meat",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300",
        inStock: true,
        quantity: 20,
        unit: "pack"
    },
    {
        name: "Orange Juice",
        description: "100% pure orange juice, 1 liter",
        price: 110,
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300",
        inStock: true,
        quantity: 35,
        unit: "liter"
    },
    {
        name: "Potatoes",
        description: "Fresh potatoes, perfect for all recipes",
        price: 30,
        category: "Vegetables",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300",
        inStock: true,
        quantity: 100,
        unit: "kg"
    }
];

const sampleUsers = [
    {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "9876543210",
        address: {
            street: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001"
        }
    },
    {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        phone: "9876543211",
        address: {
            street: "456 Oak Avenue",
            city: "Delhi",
            state: "Delhi",
            zipCode: "110001"
        }
    }
];

const seedDB = async () => {
    try {
        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        
        console.log('Cleared existing data...');
        
        // Add sample products
        await Product.insertMany(sampleProducts);
        console.log('Sample products added successfully!');
        
        // Add sample users
        await User.insertMany(sampleUsers);
        console.log('Sample users added successfully!');
        
        console.log('Database seeded successfully!');
        console.log(`Added ${sampleProducts.length} products and ${sampleUsers.length} users`);
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the seed function
seedDB();