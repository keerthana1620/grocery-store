// Main JavaScript file for InstaMart
console.log('QuickCart main.js loaded');

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let currentSearchTerm = '';

// ======== CHECKOUT DEBUG CODE ========
console.log('Main.js initialized - checkout function will be available');

// Simple test function
function testCheckout() {
    console.log('Checkout button clicked!');
    console.log('Cart items:', cart);
    console.log('User token:', localStorage.getItem('token'));
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    if (!localStorage.getItem('token')) {
        alert('Please login first!');
        window.location.href = '/login';
        return;
    }
    
    alert('Checkout process starting...');
    // Call your actual checkout function here
    checkout();
}

// Make sure functions are available globally
window.testCheckout = testCheckout;
// ======== END CHECKOUT DEBUG CODE ========

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCategories();
    updateCartCount();
    checkAuthStatus();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentSearchTerm = e.target.value.toLowerCase();
            filterProducts();
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }

    // Cart modal functionality
    const cartLink = document.getElementById('cartLink');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            displayCartItems();
            showCartModal();
        });
    }
}

// Scroll to products
function scrollToProducts() {
    document.getElementById('productsGrid').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Load products from API
async function loadProducts(category = 'all') {
    try {
        showLoading();
        let url = '/api/products';
        const params = [];
        
        if (category !== 'all') {
            params.push('category=' + category);
        }
        
        if (currentSearchTerm) {
            params.push('search=' + currentSearchTerm);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        products = await response.json();
        displayProducts(products);
        hideLoading();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again.');
        hideLoading();
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('/api/products/categories/all');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display categories in sidebar
function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;
    
    categories.forEach(category => {
        const categoryItem = document.createElement('a');
        categoryItem.href = '#';
        categoryItem.className = 'list-group-item list-group-item-action';
        categoryItem.textContent = category;
        categoryItem.onclick = () => filterByCategory(category);
        categoriesList.appendChild(categoryItem);
    });
}

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-search fa-4x mb-3"></i>
                    <h4>No products found</h4>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="btn btn-success mt-2" onclick="filterByCategory('all')">
                        Show All Products
                    </button>
                </div>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        const productCol = document.createElement('div');
        productCol.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4';
        productCol.innerHTML = `
            <div class="card product-card h-100">
                <div class="position-relative">
                    <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                         class="card-img-top product-image" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    ${discount > 0 ? `
                        <span class="position-absolute top-0 start-0 m-2 discount-badge">
                            ${discount}% OFF
                        </span>
                    ` : ''}
                    ${!product.inStock ? `
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-danger">Out of Stock</span>
                        </div>
                    ` : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted flex-grow-1">${product.description}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                ${product.originalPrice ? `
                                    <span class="original-price text-muted me-2">₹${product.originalPrice}</span>
                                ` : ''}
                                <span class="product-price">₹${product.price}</span>
                            </div>
                            <small class="text-muted">${product.unit || 'piece'}</small>
                        </div>
                        <button class="btn btn-success w-100 ${!product.inStock ? 'disabled' : ''}" 
                                onclick="addToCart('${product._id}')"
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus me-2"></i>
                            ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCol);
    });
}

// Filter products by category
function filterByCategory(category) {
    currentCategory = category;
    
    // Update active state in sidebar
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadProducts(category);
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentSearchTerm = searchInput.value.toLowerCase();
    }
    loadProducts(currentCategory);
}

// Filter products based on current search and category
function filterProducts() {
    if (!currentSearchTerm) {
        loadProducts(currentCategory);
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(currentSearchTerm) ||
        product.description.toLowerCase().includes(currentSearchTerm) ||
        product.category.toLowerCase().includes(currentSearchTerm)
    );
    displayProducts(filteredProducts);
}

// Cart functionality
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product || !product.inStock) {
        showNotification('Product is out of stock!', 'error');
        return;
    }

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            unit: product.unit
        });
    }
    
    updateCartStorage();
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartStorage();
    updateCartCount();
    displayCartItems();
    showNotification('Item removed from cart', 'info');
}

function updateCartItemQuantity(productId, change) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartStorage();
            updateCartCount();
            displayCartItems();
        }
    }
}

function updateCartStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Display cart items in modal
function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart fa-4x mb-3"></i>
                <h4>Your cart is empty</h4>
                <p>Add some products to get started!</p>
            </div>
        `;
        cartTotal.textContent = '0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="row align-items-center">
                <div class="col-2">
                    <img src="${item.image || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                         class="cart-item-image img-fluid rounded"
                         alt="${item.name}"
                         onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                </div>
                <div class="col-5">
                    <h6 class="mb-1">${item.name}</h6>
                    <small class="text-muted">₹${item.price} / ${item.unit || 'piece'}</small>
                </div>
                <div class="col-3">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateCartItemQuantity('${item.productId}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartItemQuantity('${item.productId}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="col-2 text-end">
                    <div class="fw-bold">₹${itemTotal.toFixed(2)}</div>
                    <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart('${item.productId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
}

// Show cart modal
function showCartModal() {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
}

// ======== CHECKOUT FUNCTIONALITY ========
function checkout() {
    console.log('Checkout function called');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login to checkout', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
        return;
    }
    
    // Check if cart has items
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Show checkout modal
    showCheckoutModal();
}

// Show checkout modal with form
function showCheckoutModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const checkoutModalHTML = `
        <div class="modal fade" id="checkoutModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-credit-card me-2"></i>Checkout
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="mb-3">Order Summary</h6>
                                <div class="card">
                                    <div class="card-body">
                                        ${cart.map(item => `
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <strong>${item.name}</strong>
                                                    <br>
                                                    <small class="text-muted">${item.quantity} x ₹${item.price}</small>
                                                </div>
                                                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        `).join('')}
                                        <hr>
                                        <div class="d-flex justify-content-between">
                                            <strong>Total:</strong>
                                            <strong>₹${total.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6 class="mb-3">Delivery Information</h6>
                                <form id="checkoutForm">
                                    <div class="mb-3">
                                        <label class="form-label">Full Name *</label>
                                        <input type="text" class="form-control" id="fullName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Phone Number *</label>
                                        <input type="tel" class="form-control" id="phone" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Delivery Address *</label>
                                        <textarea class="form-control" id="address" rows="3" required placeholder="Enter your complete delivery address"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">City *</label>
                                        <input type="text" class="form-control" id="city" required>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">State *</label>
                                            <input type="text" class="form-control" id="state" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">ZIP Code *</label>
                                            <input type="text" class="form-control" id="zipCode" required>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Payment Method *</label>
                                        <select class="form-select" id="paymentMethod" required>
                                            <option value="cash_on_delivery">Cash on Delivery</option>
                                            <option value="card">Credit/Debit Card</option>
                                            <option value="upi">UPI Payment</option>
                                        </select>
                                    </div>
                                    <div id="cardDetails" class="mb-3" style="display: none;">
                                        <div class="row">
                                            <div class="col-12 mb-2">
                                                <label class="form-label">Card Number</label>
                                                <input type="text" class="form-control" placeholder="1234 5678 9012 3456">
                                            </div>
                                            <div class="col-md-6 mb-2">
                                                <label class="form-label">Expiry Date</label>
                                                <input type="text" class="form-control" placeholder="MM/YY">
                                            </div>
                                            <div class="col-md-6 mb-2">
                                                <label class="form-label">CVV</label>
                                                <input type="text" class="form-control" placeholder="123">
                                            </div>
                                        </div>
                                    </div>
                                    <div id="upiDetails" class="mb-3" style="display: none;">
                                        <label class="form-label">UPI ID</label>
                                        <input type="text" class="form-control" placeholder="yourname@upi">
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="processOrder()">
                            <i class="fas fa-shopping-bag me-2"></i>Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('checkoutModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', checkoutModalHTML);
    
    // Show modal
    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    checkoutModal.show();
    
    // Add event listener for payment method change
    document.getElementById('paymentMethod').addEventListener('change', function(e) {
        const paymentMethod = e.target.value;
        document.getElementById('cardDetails').style.display = paymentMethod === 'card' ? 'block' : 'none';
        document.getElementById('upiDetails').style.display = paymentMethod === 'upi' ? 'block' : 'none';
    });
    
    // Load user data if available
    loadUserData();
}

// Load user data into checkout form
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('phone').value = user.phone || '';
    }
}

/// Process order
async function processOrder() {
    const token = localStorage.getItem('token');
    const form = document.getElementById('checkoutForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    try {
        showNotification('Processing your order...', 'info');
        
        // Save the total BEFORE clearing cart
        const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // For now, we'll simulate order processing
        setTimeout(() => {
            // Order successful
            showNotification('Order placed successfully!', 'success');
            
            // Clear cart
            cart = [];
            updateCartStorage();
            updateCartCount();
            
            // Close modals
            const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            if (checkoutModal) {
                checkoutModal.hide();
            }
            
            const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            if (cartModal) {
                cartModal.hide();
            }
            
            // Show order confirmation with the saved total
            showOrderConfirmation(orderTotal);
            
        }, 2000);
        
    } catch (error) {
        console.error('Order processing error:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}         
 
// Show order confirmation
function showOrderConfirmation(total = 0) {
    const orderId = 'ORD' + Date.now().toString().slice(-8);
    
    const confirmationHTML = `
        <div class="modal fade" id="orderConfirmationModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>Order Confirmed!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-4">
                            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="text-success mb-3">Thank you for your order!</h4>
                        <p class="mb-2">Order ID: <strong>#${orderId}</strong></p>
                        <p class="mb-2">Total Amount: <strong>₹${total.toFixed(2)}</strong></p>
                        <p class="mb-3">Estimated Delivery: <strong>30-45 minutes</strong></p>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            You will receive an order confirmation shortly.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('orderConfirmationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Show modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
    confirmationModal.show();
}
    
 
// ======== END CHECKOUT FUNCTIONALITY ========

// Notification system
function showNotification(message, type = 'info') {
    // Create toast notification
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

// Loading states
function showLoading() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-success loading-spinner" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading products...</p>
            </div>
        `;
    }
}

function hideLoading() {
    // Loading will be replaced when products are displayed
}

function showError(message) {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="text-muted">Oops! Something went wrong</h4>
                <p class="text-muted mb-3">${message}</p>
                <button onclick="loadProducts()" class="btn btn-success">
                    <i class="fas fa-redo me-2"></i>Try Again
                </button>
            </div>
        `;
    }
}

// Make functions globally available
window.filterByCategory = filterByCategory;
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.checkout = checkout;
window.processOrder = processOrder;
window.showCartModal = showCartModal;
window.scrollToProducts = scrollToProducts;

// Debug function
function debugCheckout() {
    console.log('=== DEBUG CHECKOUT ===');
    console.log('Cart:', cart);
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('User:', JSON.parse(localStorage.getItem('user')));
    console.log('Checkout function:', typeof checkout);
    console.log('=====================');
}
window.debugCheckout = debugCheckout;