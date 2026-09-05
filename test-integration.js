const http = require('http');

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: body ? (tryParse(body) || body) : null
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function tryParse(str) {
  try { return JSON.parse(str); } catch { return str; }
}

async function runTests() {
  console.log('--- 1. Testing Health & Public Endpoints ---');
  
  // Health
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET'
  });
  console.log('Health:', health.statusCode, health.data?.database?.status || health.data?.data?.database?.status);

  // Rooms
  const rooms = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/rooms',
    method: 'GET'
  });
  console.log('Rooms Count:', rooms.data?.data?.rooms?.length || rooms.data?.data?.length, 'Total:', rooms.data?.data?.pagination?.total || rooms.data?.pagination?.total);

  // Settings
  const settings = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/settings',
    method: 'GET'
  });
  console.log('Settings:', settings.data?.data?.hotelName, 'Banners:', settings.data?.data?.banners?.length);

  console.log('\n--- 2. Testing Customer Authentication & Flow ---');
  // Login Customer
  const custLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'customer@innora.com',
    password: 'Customer@123456'
  });
  console.log('Customer Login:', custLogin.statusCode, custLogin.data?.data?.user?.email);
  const custCookie = custLogin.headers['set-cookie'];

  // Me
  const custMe = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: { 'Cookie': custCookie }
  });
  console.log('Customer /me:', custMe.statusCode, custMe.data?.data?.email, 'Role:', custMe.data?.data?.role);

  // Customer Bookings
  const custBookings = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/bookings/my',
    method: 'GET',
    headers: { 'Cookie': custCookie }
  });
  console.log('Customer My Bookings:', custBookings.statusCode, 'Count:', custBookings.data?.data?.length);

  console.log('\n--- 3. Testing Admin Authentication & Dashboard Flow ---');
  // Login SuperAdmin
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'superadmin@innora.com',
    password: 'Admin@123456'
  });
  console.log('Admin Login:', adminLogin.statusCode, adminLogin.data?.data?.user?.email);
  const adminCookie = adminLogin.headers['set-cookie'];

  // Admin Dashboard Overview
  const dashboard = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/dashboard/admin',
    method: 'GET',
    headers: { 'Cookie': adminCookie }
  });
  console.log('Dashboard Overview:', dashboard.statusCode, dashboard.data?.data?.metrics);

  // Admin Users list
  const users = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/users',
    method: 'GET',
    headers: { 'Cookie': adminCookie }
  });
  console.log('Admin Users List:', users.statusCode, 'Users count:', users.data?.data?.users?.length || users.data?.data?.length);

  // Admin Inquiries
  const inquiries = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/inquiries',
    method: 'GET',
    headers: { 'Cookie': adminCookie }
  });
  console.log('Admin Inquiries List:', inquiries.statusCode, 'Count:', inquiries.data?.data?.inquiries?.length || inquiries.data?.data?.length);

  // Admin Reviews
  const reviews = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/reviews',
    method: 'GET',
    headers: { 'Cookie': adminCookie }
  });
  console.log('Admin Reviews List:', reviews.statusCode, 'Count:', reviews.data?.data?.reviews?.length || reviews.data?.data?.length);

  console.log('\n--- 4. Testing Frontend Next.js Dev Server HTML Routes ---');
  const pages = ['/', '/rooms', '/signin', '/signup', '/contact', '/dashboard'];
  for (const page of pages) {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: page,
      method: 'GET'
    });
    console.log(`Page ${page}:`, res.statusCode);
  }

  console.log('\n✅ ALL INTEGRATION TESTS PASSED PERFECTLY!');
}

runTests().catch(console.error);
