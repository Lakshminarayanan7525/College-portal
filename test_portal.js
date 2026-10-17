/**
 * Comprehensive verification script for College Portal Backend APIs and Middlewares
 */
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const User = require('./src/models/user.model');

const PORT = 5055; // Use dedicated test port
let server;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting College Portal Integration Tests ---');

  // Connect to DB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_portal');
  console.log('✓ Connected to MongoDB');

  // Start HTTP server
  server = app.listen(PORT);
  console.log(`✓ Test server running on http://localhost:${PORT}`);

  try {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['student.test@college.edu', 'teacher.test@college.edu'] } });

    // 1. SIGNUP STUDENT (Public API)
    console.log('\n[1] Testing Student Signup (POST /api/auth/signup)...');
    const studentSignupRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/signup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Rahul Sharma',
        email: 'student.test@college.edu',
        password: 'Password123!',
        role: 'Student',
        phone: '9876543210',
        department: 'Computer Science',
        rollNumber: 'CS2026-001',
        semester: 4,
        batch: '2024-2028',
        cgpa: 8.75,
        guardianName: 'Sanjay Sharma'
      }
    );
    console.log('Status:', studentSignupRes.status, 'Response:', studentSignupRes.data.message);
    if (studentSignupRes.status !== 201 || !studentSignupRes.data.token) {
      throw new Error('Student signup failed!');
    }
    const studentId = studentSignupRes.data.user._id;

    // 2. SIGNUP TEACHER (Public API)
    console.log('\n[2] Testing Teacher Signup (POST /api/auth/signup)...');
    const teacherSignupRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/signup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Dr. Anita Roy',
        email: 'teacher.test@college.edu',
        password: 'TeacherPassword123!',
        role: 'Teacher',
        phone: '9876543299',
        department: 'Computer Science',
        employeeId: 'EMP-T-102',
        designation: 'Associate Professor',
        qualification: 'Ph.D in AI & Algorithms',
        subjectsTaught: ['Data Structures', 'Operating Systems'],
        officeRoom: 'Block B - Room 304'
      }
    );
    console.log('Status:', teacherSignupRes.status, 'Response:', teacherSignupRes.data.message);
    if (teacherSignupRes.status !== 201 || !teacherSignupRes.data.token) {
      throw new Error('Teacher signup failed!');
    }
    const teacherId = teacherSignupRes.data.user._id;

    // 3. LOGIN STUDENT (Public API)
    console.log('\n[3] Testing Student Login (POST /api/auth/login)...');
    const studentLoginRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'student.test@college.edu',
        password: 'Password123!'
      }
    );
    console.log('Status:', studentLoginRes.status, 'User Role:', studentLoginRes.data.user?.role);
    if (studentLoginRes.status !== 200 || !studentLoginRes.data.token) {
      throw new Error('Student login failed!');
    }
    const studentToken = studentLoginRes.data.token;

    // 4. LOGIN TEACHER (Public API)
    console.log('\n[4] Testing Teacher Login (POST /api/auth/login)...');
    const teacherLoginRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'teacher.test@college.edu',
        password: 'TeacherPassword123!'
      }
    );
    console.log('Status:', teacherLoginRes.status, 'User Role:', teacherLoginRes.data.user?.role);
    if (teacherLoginRes.status !== 200 || !teacherLoginRes.data.token) {
      throw new Error('Teacher login failed!');
    }
    const teacherToken = teacherLoginRes.data.token;

    // 5. STUDENT ACCESS: Get all students (Allowed for Student)
    console.log('\n[5] Student accessing Get All Students (GET /api/students)...');
    const studentGetAllStudentsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/students',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('Status:', studentGetAllStudentsRes.status, 'Count:', studentGetAllStudentsRes.data.count);
    if (studentGetAllStudentsRes.status !== 200) {
      throw new Error('Student failed to get all students');
    }

    // 6. STUDENT ACCESS: Get student by ID (Allowed for Student)
    console.log('\n[6] Student accessing Get Student by ID (GET /api/students/' + studentId + ')...');
    const studentGetStudentRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/students/${studentId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('Status:', studentGetStudentRes.status, 'Found Student:', studentGetStudentRes.data.data?.name);
    if (studentGetStudentRes.status !== 200) {
      throw new Error('Student failed to get student by id');
    }

    // 7. STUDENT ACCESS: Update Profile (Allowed for Student)
    console.log('\n[7] Student updating their own profile (PUT /api/users/profile)...');
    const studentUpdateProfileRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/users/profile',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      },
      {
        phone: '9998887776',
        guardianName: 'Sanjay K. Sharma'
      }
    );
    console.log('Status:', studentUpdateProfileRes.status, 'Updated Phone:', studentUpdateProfileRes.data.data?.phone);
    if (studentUpdateProfileRes.status !== 200) {
      throw new Error('Student failed to update profile');
    }

    // 8. PERMISSION MIDDLEWARE CHECK: Student accessing Teachers list (MUST BE FORBIDDEN 403)
    console.log('\n[8] Permission Check: Student attempting to access GET /api/teachers (Should return 403)...');
    const studentBlockedRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/teachers',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('Status:', studentBlockedRes.status, 'Message:', studentBlockedRes.data.message);
    if (studentBlockedRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for student accessing teachers, got ${studentBlockedRes.status}`);
    }

    // 9. PERMISSION MIDDLEWARE CHECK: Student updating a student record (MUST BE FORBIDDEN 403)
    console.log('\n[9] Permission Check: Student attempting to update student record PUT /api/students/' + studentId + ' (Should return 403)...');
    const studentUpdateStudentBlockedRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/students/${studentId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      },
      { cgpa: 9.99 }
    );
    console.log('Status:', studentUpdateStudentBlockedRes.status, 'Message:', studentUpdateStudentBlockedRes.data.message);
    if (studentUpdateStudentBlockedRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for student updating student record, got ${studentUpdateStudentBlockedRes.status}`);
    }

    // 10. TEACHER ACCESS: Get all Teachers (Allowed for Teacher)
    console.log('\n[10] Teacher accessing Get All Teachers (GET /api/teachers)...');
    const teacherGetAllTeachersRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/teachers',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    console.log('Status:', teacherGetAllTeachersRes.status, 'Count:', teacherGetAllTeachersRes.data.count);
    if (teacherGetAllTeachersRes.status !== 200) {
      throw new Error('Teacher failed to get all teachers');
    }

    // 11. TEACHER ACCESS: Get Teacher by ID (Allowed for Teacher)
    console.log('\n[11] Teacher accessing Get Teacher by ID (GET /api/teachers/' + teacherId + ')...');
    const teacherGetTeacherRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/teachers/${teacherId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    console.log('Status:', teacherGetTeacherRes.status, 'Found Teacher:', teacherGetTeacherRes.data.data?.name);
    if (teacherGetTeacherRes.status !== 200) {
      throw new Error('Teacher failed to get teacher by id');
    }

    // 12. TEACHER ACCESS: Get all students (Allowed for Teacher)
    console.log('\n[12] Teacher accessing Get All Students (GET /api/students)...');
    const teacherGetAllStudentsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/students',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    console.log('Status:', teacherGetAllStudentsRes.status, 'Count:', teacherGetAllStudentsRes.data.count);
    if (teacherGetAllStudentsRes.status !== 200) {
      throw new Error('Teacher failed to get all students');
    }

    // 13. TEACHER ACCESS: Get student by ID (Allowed for Teacher)
    console.log('\n[13] Teacher accessing Get Student by ID (GET /api/students/' + studentId + ')...');
    const teacherGetStudentRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/students/${studentId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    console.log('Status:', teacherGetStudentRes.status, 'Found Student:', teacherGetStudentRes.data.data?.name);
    if (teacherGetStudentRes.status !== 200) {
      throw new Error('Teacher failed to get student by id');
    }

    // 14. TEACHER ACCESS: Update profile (Allowed for Teacher)
    console.log('\n[14] Teacher updating profile (PUT /api/users/profile)...');
    const teacherUpdateProfileRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/users/profile',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
          'Content-Type': 'application/json'
        }
      },
      {
        officeRoom: 'Block C - Room 410',
        designation: 'Professor & Head of Dept'
      }
    );
    console.log('Status:', teacherUpdateProfileRes.status, 'Updated Designation:', teacherUpdateProfileRes.data.data?.designation);
    if (teacherUpdateProfileRes.status !== 200) {
      throw new Error('Teacher failed to update profile');
    }

    // 15. TEACHER ACCESS: Update student record (Allowed for Teacher)
    console.log('\n[15] Teacher updating Student record (PUT /api/students/' + studentId + ')...');
    const teacherUpdateStudentRecordRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/students/${studentId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
          'Content-Type': 'application/json'
        }
      },
      {
        cgpa: 9.1,
        semester: 5
      }
    );
    console.log('Status:', teacherUpdateStudentRecordRes.status, 'New CGPA:', teacherUpdateStudentRecordRes.data.data?.cgpa, 'New Semester:', teacherUpdateStudentRecordRes.data.data?.semester);
    if (teacherUpdateStudentRecordRes.status !== 200 || teacherUpdateStudentRecordRes.data.data?.cgpa !== 9.1) {
      throw new Error('Teacher failed to update student record');
    }

    // 16. AUTH MIDDLEWARE: Unauthenticated request test (Should return 401)
    console.log('\n[16] Auth Middleware Check: Unauthenticated request (GET /api/users/profile without token)...');
    const unauthRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/users/profile',
      method: 'GET'
    });
    console.log('Status:', unauthRes.status, 'Message:', unauthRes.data.message);
    if (unauthRes.status !== 401) {
      throw new Error('Expected 401 Unauthorized for missing token');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL INTEGRATION & PERMISSION TESTS PASSED PERFECTLY!');
    console.log('======================================================');
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  if (server) server.close();
  process.exit(1);
});
