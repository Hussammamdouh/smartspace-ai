const api = require('./services/api').default;

async function testCartAPI() {
  console.log('Testing Cart API...');
  
  try {
    // Test getting cart
    console.log('\n1. Testing getCart...');
    const cartResponse = await api.getCart();
    console.log('Cart Response:', JSON.stringify(cartResponse, null, 2));
    
    // Test adding to cart (if we have a product ID)
    console.log('\n2. Testing addToCart...');
    // You'll need to replace this with an actual product ID from your database
    const productId = '507f1f77bcf86cd799439011'; // Example ID
    const addResponse = await api.addToCart(productId, 1);
    console.log('Add to Cart Response:', JSON.stringify(addResponse, null, 2));
    
    // Test getting cart again
    console.log('\n3. Testing getCart after adding...');
    const cartResponse2 = await api.getCart();
    console.log('Cart Response after adding:', JSON.stringify(cartResponse2, null, 2));
    
  } catch (error) {
    console.error('Error testing cart API:', error);
  }
}

// Run the test
testCartAPI(); 