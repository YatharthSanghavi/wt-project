// scripts/seedDatabase.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Institute = require('../models/Institute');
const Department = require('../models/Department');
const Event = require('../models/Event');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frolic');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Institute.deleteMany({});
    await Department.deleteMany({});
    await Event.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@frolic.com',
      phone: '1234567890',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created');

    // Create Institute Coordinators
    const instituteCoord1 = await User.create({
      name: 'John Doe',
      email: 'john@frolic.com',
      phone: '1234567891',
      password: 'john123',
      role: 'institute_coordinator'
    });

    const instituteCoord2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@frolic.com',
      phone: '1234567892',
      password: 'jane123',
      role: 'institute_coordinator'
    });

    console.log('✅ Institute coordinators created');

    // Create Department Coordinators
    const deptCoord1 = await User.create({
      name: 'Dr. Alan Turing',
      email: 'alan@frolic.com',
      phone: '1234567893',
      password: 'alan123',
      role: 'department_coordinator'
    });

    const deptCoord2 = await User.create({
      name: 'Dr. Ada Lovelace',
      email: 'ada@frolic.com',
      phone: '1234567894',
      password: 'ada123',
      role: 'department_coordinator'
    });

    console.log('✅ Department coordinators created');

    // Create Event Coordinators
    const eventCoord1 = await User.create({
      name: 'Tech Lead',
      email: 'techlead@frolic.com',
      phone: '1234567895',
      password: 'tech123',
      role: 'event_coordinator'
    });

    console.log('✅ Event coordinators created');

    // Create Students
    const student1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@student.com',
      phone: '1234567896',
      password: 'alice123',
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Bob Williams',
      email: 'bob@student.com',
      phone: '1234567897',
      password: 'bob123',
      role: 'student'
    });

    console.log('✅ Students created');

    // Create Institutes
    const mit = await Institute.create({
      instituteName: 'Massachusetts Institute of Technology',
      city: 'Cambridge',
      instituteImage: 'https://example.com/mit.jpg',
      coordinatorId: instituteCoord1._id,
      modifiedBy: admin._id
    });

    const stanford = await Institute.create({
      instituteName: 'Stanford University',
      city: 'Stanford',
      instituteImage: 'https://example.com/stanford.jpg',
      coordinatorId: instituteCoord2._id,
      modifiedBy: admin._id
    });

    const harvard = await Institute.create({
      instituteName: 'Harvard University',
      city: 'Cambridge',
      instituteImage: 'https://example.com/harvard.jpg',
      coordinatorId: instituteCoord1._id,
      modifiedBy: admin._id
    });

    console.log('✅ Institutes created');

    // Create Departments
    const csAtMIT = await Department.create({
      departmentName: 'Computer Science',
      instituteId: mit._id,
      description: 'Study of computation and information',
      departmentImage: 'https://example.com/cs.jpg',
      coordinatorId: deptCoord1._id,
      modifiedBy: admin._id
    });

    const eeAtMIT = await Department.create({
      departmentName: 'Electrical Engineering',
      instituteId: mit._id,
      description: 'Study of electrical systems',
      departmentImage: 'https://example.com/ee.jpg',
      coordinatorId: deptCoord2._id,
      modifiedBy: admin._id
    });

    const csAtStanford = await Department.create({
      departmentName: 'Computer Science',
      instituteId: stanford._id,
      description: 'Innovation in computing',
      coordinatorId: deptCoord1._id,
      modifiedBy: admin._id
    });

    const meAtHarvard = await Department.create({
      departmentName: 'Mechanical Engineering',
      instituteId: harvard._id,
      description: 'Design and analysis of mechanical systems',
      coordinatorId: deptCoord2._id,
      modifiedBy: admin._id
    });

    console.log('✅ Departments created');

    // Create Events
    const hackathon = await Event.create({
      eventName: 'Tech Hackathon 2026',
      tagline: 'Code. Create. Innovate.',
      description: 'A 24-hour coding marathon for innovative minds',
      departmentId: csAtMIT._id,
      eventImage: 'https://example.com/hackathon.jpg',
      fees: 50,
      prizes: '1st: $5000, 2nd: $3000, 3rd: $1000',
      groupMinParticipants: 2,
      groupMaxParticipants: 4,
      eventLocation: 'Main Campus Auditorium',
      maxGroupsAllowed: 50,
      coordinatorId: eventCoord1._id,
      studentCoordinatorName: 'Sarah Connor',
      studentCoordinatorPhone: '9876543210',
      studentCoordinatorEmail: 'sarah@student.com',
      modifiedBy: admin._id
    });

    const robotics = await Event.create({
      eventName: 'Robotics Challenge',
      tagline: 'Build. Battle. Win.',
      description: 'Design and compete with autonomous robots',
      departmentId: eeAtMIT._id,
      eventImage: 'https://example.com/robotics.jpg',
      fees: 75,
      prizes: '1st: $10000, 2nd: $5000, 3rd: $2500',
      groupMinParticipants: 3,
      groupMaxParticipants: 5,
      eventLocation: 'Engineering Lab',
      maxGroupsAllowed: 30,
      coordinatorId: eventCoord1._id,
      studentCoordinatorName: 'John Connor',
      studentCoordinatorPhone: '9876543211',
      studentCoordinatorEmail: 'john@student.com',
      modifiedBy: admin._id
    });

    const aiCompetition = await Event.create({
      eventName: 'AI Innovation Challenge',
      tagline: 'Intelligence Redefined',
      description: 'Showcase your AI and ML skills',
      departmentId: csAtStanford._id,
      eventImage: 'https://example.com/ai.jpg',
      fees: 60,
      prizes: '1st: $7000, 2nd: $4000, 3rd: $2000',
      groupMinParticipants: 1,
      groupMaxParticipants: 3,
      eventLocation: 'Innovation Hub',
      maxGroupsAllowed: 40,
      coordinatorId: eventCoord1._id,
      studentCoordinatorName: 'Emily Davis',
      studentCoordinatorPhone: '9876543212',
      studentCoordinatorEmail: 'emily@student.com',
      modifiedBy: admin._id
    });

    const designThinkathon = await Event.create({
      eventName: 'Design Thinkathon',
      tagline: 'Design the Future',
      description: 'Problem-solving through creative design',
      departmentId: meAtHarvard._id,
      eventImage: 'https://example.com/design.jpg',
      fees: 40,
      prizes: '1st: $3000, 2nd: $2000, 3rd: $1000',
      groupMinParticipants: 2,
      groupMaxParticipants: 4,
      eventLocation: 'Design Studio',
      maxGroupsAllowed: 25,
      coordinatorId: eventCoord1._id,
      studentCoordinatorName: 'Michael Brown',
      studentCoordinatorPhone: '9876543213',
      studentCoordinatorEmail: 'michael@student.com',
      modifiedBy: admin._id
    });

    console.log('✅ Events created');

    console.log('\n=================================');
    console.log('🎉 Database seeded successfully!');
    console.log('=================================');
    console.log('\n📋 Login Credentials:');
    console.log('\nAdmin:');
    console.log('  Email: admin@frolic.com');
    console.log('  Password: admin123');
    console.log('\nInstitute Coordinator:');
    console.log('  Email: john@frolic.com');
    console.log('  Password: john123');
    console.log('\nDepartment Coordinator:');
    console.log('  Email: alan@frolic.com');
    console.log('  Password: alan123');
    console.log('\nEvent Coordinator:');
    console.log('  Email: techlead@frolic.com');
    console.log('  Password: tech123');
    console.log('\nStudent:');
    console.log('  Email: alice@student.com');
    console.log('  Password: alice123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => seedData());