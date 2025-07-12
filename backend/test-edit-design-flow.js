const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the complete flow from chatbot to edit design
async function testEditDesignFlow() {
  try {
    console.log('🧪 Testing Edit Design Flow from Chatbot');
    console.log('==========================================');

    // Step 1: Login to get a token
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');

    // Step 2: Generate an image via chatbot
    console.log('\n2. Generating image via chatbot...');
    const chatResponse = await axios.post(`${BASE_URL}/chat/conversation`, {
      title: 'Test Conversation'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversationId = chatResponse.data.data._id;
    console.log('✅ Conversation created:', conversationId);

    // Step 3: Send image generation message
    console.log('\n3. Sending image generation message...');
    const imageResponse = await axios.post(`${BASE_URL}/chat/${conversationId}/message`, {
      message: 'Design a modern living room with a sofa and coffee table',
      model: 'image'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Image generation response:', {
      status: imageResponse.data.status,
      hasImageUrl: !!imageResponse.data.data.response,
      hasDesignData: !!imageResponse.data.data.designData,
      designId: imageResponse.data.data.designData?.designId
    });

    if (imageResponse.data.data.designData?.designId) {
      const designId = imageResponse.data.data.designData.designId;
      
      // Step 4: Test fetching the design for editing
      console.log('\n4. Testing fetch design for editing...');
      const editResponse = await axios.get(`${BASE_URL}/edit-design/${designId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Edit design response:', {
        success: editResponse.data.success,
        hasData: !!editResponse.data.data,
        hasImageUrl: !!editResponse.data.data?.imageUrl,
        imageUrl: editResponse.data.data?.imageUrl
      });
      
      if (editResponse.data.data?.imageUrl) {
        console.log('✅ Design can be loaded for editing!');
        console.log('Image URL:', editResponse.data.data.imageUrl);
      } else {
        console.log('❌ Design loaded but no image URL');
      }
    } else {
      console.log('❌ No design ID in response');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testEditDesignFlow(); 