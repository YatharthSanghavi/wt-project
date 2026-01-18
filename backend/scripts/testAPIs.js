const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

const testAPI = async () => {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Register User
    console.log('1️⃣ Testing User Registration...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9999999999',
      password: 'test123',
      role: 'student'
    });
    console.log('✅ User registered:', registerRes.data.data.user.name);

    // Test 2: Login
    console.log('\n2️⃣ Testing Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@frolic.com',
      password: 'admin123'
    });
    authToken = loginRes.data.data.token;
    console.log('✅ Login successful, token received');

    // Test 3: Get Current User
    console.log('\n3️⃣ Testing Get Current User...');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Current user:', meRes.data.data.name);

    // Test 4: Get All Institutes
    console.log('\n4️⃣ Testing Get All Institutes...');
    const institutesRes = await axios.get(`${BASE_URL}/institutes`);
    console.log(`✅ Found ${institutesRes.data.count} institutes`);

    // Test 5: Create Institute
    console.log('\n5️⃣ Testing Create Institute...');
    const newInstituteRes = await axios.post(
      `${BASE_URL}/institutes`,
      {
        instituteName: 'Test Institute',
        city: 'Test City'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Institute created:', newInstituteRes.data.data.instituteName);
    const instituteId = newInstituteRes.data.data._id;

    // Test 6: Get All Departments
    console.log('\n6️⃣ Testing Get All Departments...');
    const departmentsRes = await axios.get(`${BASE_URL}/departments`);
    console.log(`✅ Found ${departmentsRes.data.count} departments`);

    // Test 7: Create Department
    console.log('\n7️⃣ Testing Create Department...');
    const newDeptRes = await axios.post(
      `${BASE_URL}/departments`,
      {
        departmentName: 'Test Department',
        instituteId: instituteId,
        description: 'Test description'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Department created:', newDeptRes.data.data.departmentName);
    const deptId = newDeptRes.data.data._id;

    // Test 8: Get Departments of Institute
    console.log('\n8️⃣ Testing Get Departments of Institute...');
    const instDeptRes = await axios.get(`${BASE_URL}/institutes/${instituteId}/departments`);
    console.log(`✅ Found ${instDeptRes.data.count} departments for institute`);

    // Test 9: Get All Events
    console.log('\n9️⃣ Testing Get All Events...');
    const eventsRes = await axios.get(`${BASE_URL}/events`);
    console.log(`✅ Found ${eventsRes.data.count} events`);

    // Test 10: Create Event
    console.log('\n🔟 Testing Create Event...');
    const newEventRes = await axios.post(
      `${BASE_URL}/events`,
      {
        eventName: 'Test Event',
        tagline: 'Test tagline',
        description: 'Test description',
        departmentId: deptId,
        fees: 100,
        prizes: 'Test prizes',
        groupMinParticipants: 2,
        groupMaxParticipants: 5,
        eventLocation: 'Test Location',
        maxGroupsAllowed: 20
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Event created:', newEventRes.data.data.eventName);
    const eventId = newEventRes.data.data._id;

    // Test 11: Get Event Details
    console.log('\n1️⃣1️⃣ Testing Get Event Details...');
    const eventDetailRes = await axios.get(`${BASE_URL}/events/${eventId}`);
    console.log('✅ Event details retrieved:', eventDetailRes.data.data.eventName);

    // Test 12: Update Event
    console.log('\n1️⃣2️⃣ Testing Update Event...');
    const updateEventRes = await axios.patch(
      `${BASE_URL}/events/${eventId}`,
      {
        eventName: 'Updated Test Event',
        fees: 150
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Event updated:', updateEventRes.data.data.eventName);

    // Test 13: Get Event Summary
    console.log('\n1️⃣3️⃣ Testing Get Event Summary...');
    const summaryRes = await axios.get(`${BASE_URL}/events/${eventId}/summary`);
    console.log('✅ Event summary:', summaryRes.data.data);

    console.log('\n=================================');
    console.log('🎉 All tests passed successfully!');
    console.log('=================================\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Wait for server to start
setTimeout(() => {
  testAPI();
}, 2000);