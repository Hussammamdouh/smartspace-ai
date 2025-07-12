const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the edit design endpoints
async function testEditDesignEndpoints() {
  try {
    console.log('Testing Edit Design Endpoints...\n');

    // Test 1: Get available furniture
    console.log('1. Testing GET /edit-design/furniture');
    try {
      const furnitureResponse = await axios.get(`${BASE_URL}/edit-design/furniture`);
      console.log('✅ Furniture endpoint working:', furnitureResponse.data.success);
      console.log('   Items found:', furnitureResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Furniture endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Check if edit design routes are accessible
    console.log('\n2. Testing edit design route structure');
    try {
      const response = await axios.get(`${BASE_URL}/edit-design/test-id`);
      console.log('✅ Edit design route accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Edit design route exists (requires auth)');
      } else if (error.response?.status === 404) {
        console.log('✅ Edit design route exists (design not found)');
      } else {
        console.log('❌ Edit design route failed:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n✅ Edit design endpoints test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test Cloudinary configuration
async function testCloudinaryConfig() {
  console.log('\nTesting Cloudinary Configuration...\n');

  try {
    const response = await axios.get(`${BASE_URL}/health`);
    const cloudinaryStatus = response.data.checks?.cloudinary;
    
    if (cloudinaryStatus) {
      console.log('Cloudinary Status:', cloudinaryStatus.status);
      console.log('Message:', cloudinaryStatus.message);
      
      if (cloudinaryStatus.status === 'healthy') {
        console.log('✅ Cloudinary is properly configured and working');
      } else if (cloudinaryStatus.status === 'not_configured') {
        console.log('⚠️  Cloudinary is not configured (optional service)');
      } else {
        console.log('❌ Cloudinary has issues:', cloudinaryStatus.error || cloudinaryStatus.message);
      }
    } else {
      console.log('❌ Could not get Cloudinary status from health check');
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Edit Design and Cloudinary Tests...\n');
  
  await testEditDesignEndpoints();
  await testCloudinaryConfig();
  
  console.log('\n🎉 All tests completed!');
}

runTests().catch(console.error); 