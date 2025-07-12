const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test authentication endpoints
async function testAuthentication() {
  console.log('🔐 Testing Authentication...\n');

  try {
    console.log('1. Testing health endpoint (should work without auth)');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health endpoint working:', response.data.status);
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.response?.data?.message || error.message);
    }

    console.log('\n2. Testing protected endpoint without auth (should return 401)');
    try {
      const response = await axios.get(`${BASE_URL}/edit-design/furniture`);
      console.log('❌ Should have returned 401, but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n3. Testing edit design endpoint without auth (should return 401)');
    try {
      const response = await axios.post(`${BASE_URL}/edit-design/test-id/edit`, {
        action: 'add',
        furnitureItems: [],
        prompt: 'test'
      });
      console.log('❌ Should have returned 401, but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n4. Testing AI generate endpoint without auth (should return 401)');
    try {
      const response = await axios.post(`${BASE_URL}/ai/generate-image`, {
        prompt: 'test design',
        style: 'modern',
        size: '1024x1024'
      });
      console.log('❌ Should have returned 401, but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n✅ Authentication test completed!');
    console.log('\n📝 Summary:');
    console.log('- All protected endpoints should return 401 without authentication');
    console.log('- This confirms the backend is properly protecting routes');
    console.log('- Frontend should handle 401 errors by redirecting to login');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testAuthentication().catch(console.error); 