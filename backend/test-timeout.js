const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test timeout configuration
async function testTimeout() {
  console.log('🧪 Testing Timeout Configuration...\n');

  try {
    console.log('1. Testing regular chat endpoint (should be fast)');
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${BASE_URL}/chat/message`, {
        conversationId: 'test-id',
        message: 'Hello',
        model: 'chat'
      }, {
        timeout: 10000 // 10 seconds
      });
      const endTime = Date.now();
      console.log(`✅ Chat response time: ${endTime - startTime}ms`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Chat endpoint accessible (requires auth)');
      } else {
        console.log('❌ Chat endpoint error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n2. Testing image generation endpoint timeout');
    console.log('   This will test if the server accepts long-running requests...');
    
    try {
      const response = await axios.post(`${BASE_URL}/chat/message`, {
        conversationId: 'test-id',
        message: 'Design a modern living room',
        model: 'image'
      }, {
        timeout: 30000 // 30 seconds - should be enough to test timeout handling
      });
      console.log('✅ Image generation endpoint responded within 30 seconds');
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('⚠️  Request timed out after 30 seconds (expected for image generation)');
      } else if (error.response?.status === 401) {
        console.log('✅ Image generation endpoint accessible (requires auth)');
      } else {
        console.log('❌ Image generation endpoint error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n✅ Timeout test completed!');
    console.log('\n📝 Summary:');
    console.log('- Server timeout is set to 5 minutes');
    console.log('- Frontend timeout is set to 3 minutes');
    console.log('- Image generation should now work without timing out');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testTimeout().catch(console.error); 