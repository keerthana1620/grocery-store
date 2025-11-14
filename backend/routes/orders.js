const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;
        
        // Validate items and update product quantities
        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ 
                    message: `Product ${item.name} not found` 
                });
            }
            
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient quantity for ${item.name}. Available: ${product.quantity}` 
                });
            }
            
            // Reduce product quantity
            product.quantity -= item.quantity;
            if (product.quantity === 0) {
                product.inStock = false;
            }
            await product.save();
        }
        
        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            deliveryAddress: deliveryAddress || req.user.address,
            paymentMethod
        });
        
        const savedOrder = await order.save();
        
        // Populate the order with product details
        await savedOrder.populate('user', 'name email phone');
        await savedOrder.populate('items.product', 'name category');
        
        res.status(201).json({
            message: 'Order placed successfully!',
            order: savedOrder
        });
        
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name image category')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name image category');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if order belongs to the user
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (for admin)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;