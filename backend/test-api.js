/**
 * Simple API test script for the Sharing Platform backend
 * Run with: node test-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const MOCK_USER = 'test@microsoft.com';

async function testAPI() {
  console.log('🧪 Testing Sharing Platform API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', health.data);
    console.log();

    // Test 2: API info
    console.log('2️⃣ Testing API info...');
    const apiInfo = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API info:', apiInfo.data);
    console.log();

    // Test 3: List prototypes (empty)
    console.log('3️⃣ Testing list prototypes...');
    const prototypes = await axios.get(`${BASE_URL}/api/prototypes`);
    console.log('✅ Prototypes (should be empty):', prototypes.data);
    console.log();

    // Test 4: Create a prototype
    console.log('4️⃣ Testing create prototype...');
    const newPrototype = {
      name: 'Test React App',
      description: 'A test React application',
      gitHubRepoUrl: 'https://github.com/facebook/create-react-app'
    };

    const createResponse = await axios.post(
      `${BASE_URL}/api/prototypes`,
      newPrototype,
      {
        headers: {
          'x-mock-user': MOCK_USER,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Created prototype:', {
      id: createResponse.data.id,
      name: createResponse.data.name,
      buildStatus: createResponse.data.buildStatus
    });
    
    const prototypeId = createResponse.data.id;
    console.log();

    // Test 5: Get specific prototype
    console.log('5️⃣ Testing get prototype by ID...');
    const prototypeDetail = await axios.get(`${BASE_URL}/api/prototypes/${prototypeId}`);
    console.log('✅ Prototype details:', {
      id: prototypeDetail.data.id,
      name: prototypeDetail.data.name,
      gitHubOwner: prototypeDetail.data.gitHubOwner,
      gitHubRepoName: prototypeDetail.data.gitHubRepoName
    });
    console.log();

    // Test 6: Update prototype
    console.log('6️⃣ Testing update prototype...');
    const updateData = {
      name: 'Updated Test React App',
      description: 'An updated description'
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/api/prototypes/${prototypeId}`,
      updateData,
      {
        headers: {
          'x-mock-user': MOCK_USER,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Updated prototype:', {
      id: updateResponse.data.id,
      name: updateResponse.data.name,
      description: updateResponse.data.description
    });
    console.log();

    // Test 7: List my prototypes
    console.log('7️⃣ Testing list my prototypes...');
    const myPrototypes = await axios.get(`${BASE_URL}/api/prototypes?my=true`, {
      headers: {
        'x-mock-user': MOCK_USER
      }
    });
    console.log('✅ My prototypes:', myPrototypes.data.length > 0 ? 'Found prototypes' : 'No prototypes');
    console.log();

    // Test 8: GitHub auth URL
    console.log('8️⃣ Testing GitHub auth URL...');
    try {
      const githubAuth = await axios.get(`${BASE_URL}/api/github/auth`);
      console.log('✅ GitHub auth URL generated:', githubAuth.data.authUrl ? 'Success' : 'Failed');
    } catch (error) {
      console.log('⚠️ GitHub auth not configured (expected if no GitHub OAuth setup)');
    }
    console.log();

    // Test 9: Trigger rebuild
    console.log('9️⃣ Testing prototype rebuild...');
    const rebuildResponse = await axios.post(
      `${BASE_URL}/api/prototypes/${prototypeId}/rebuild`,
      {},
      {
        headers: {
          'x-mock-user': MOCK_USER
        }
      }
    );
    console.log('✅ Rebuild triggered:', rebuildResponse.data.message);
    console.log();

    // Test 10: Delete prototype
    console.log('🔟 Testing delete prototype...');
    await axios.delete(
      `${BASE_URL}/api/prototypes/${prototypeId}`,
      {
        headers: {
          'x-mock-user': MOCK_USER
        }
      }
    );
    console.log('✅ Prototype deleted successfully');
    console.log();

    console.log('🎉 All tests passed! The API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run tests
testAPI();