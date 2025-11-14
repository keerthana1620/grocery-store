// fixBroccoliImage.js
const mongoose = require('mongoose');

// Use the same connection as your app
mongoose.connect('mongodb://localhost:27017/grocery-store', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Product = mongoose.model('Product', {
    name: String,
    description: String, 
    price: Number,
    category: String,
    image: String,
    inStock: Boolean,
    quantity: Number,
    unit: String
});

async function updateBroccoliImage() {
    try {
        console.log('🔄 Updating broccoli image...');
        
        const result = await Product.updateOne(
            { name: "Broccoli" },
            { 
                $set: { 
                    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=300&fit=crop"
                } 
            }
        );
        
        console.log('✅ Broccoli image updated successfully!');
        console.log('📊 Result:', result);
        
        // Verify the change
        const broccoli = await Product.findOne({ name: "Broccoli" });
        console.log('🔍 Updated broccoli:', broccoli);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('📦 Connection closed');
        process.exit();
    }
}

updateBroccoliImage();