// scripts/seedDatabase.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Institute = require('../models/Institute');
const Department = require('../models/Department');
const Event = require('../models/Event');
const Group = require('../models/Group');
const Participant = require('../models/Participant');
const EventWiseWinner = require('../models/EventWiseWinner');

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
    await Group.deleteMany({});
    await Participant.deleteMany({});
    await EventWiseWinner.deleteMany({});

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
      role: 'instituteCoord'
    });

    const instituteCoord2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@frolic.com',
      phone: '1234567892',
      password: 'jane123',
      role: 'instituteCoord'
    });

    console.log('✅ Institute coordinators created');

    // Create Department Coordinators
    const deptCoord1 = await User.create({
      name: 'Dr. Alan Turing',
      email: 'alan@frolic.com',
      phone: '1234567893',
      password: 'alan123',
      role: 'departmentCoord'
    });

    const deptCoord2 = await User.create({
      name: 'Dr. Ada Lovelace',
      email: 'ada@frolic.com',
      phone: '1234567894',
      password: 'ada123',
      role: 'departmentCoord'
    });

    console.log('✅ Department coordinators created');

    // Create Event Coordinators
    const eventCoord1 = await User.create({
      name: 'Tech Lead',
      email: 'techlead@frolic.com',
      phone: '1234567895',
      password: 'tech123',
      role: 'eventCoord'
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

    // Create Groups
    const group1 = await Group.create({
      groupName: 'Code Warriors',
      eventId: hackathon._id,
      isPaymentDone: true,
      isPresent: true,
      createdBy: student1._id,
      modifiedBy: student1._id
    });

    const group2 = await Group.create({
      groupName: 'Tech Titans',
      eventId: hackathon._id,
      isPaymentDone: true,
      isPresent: true,
      createdBy: student2._id,
      modifiedBy: student2._id
    });

    const group3 = await Group.create({
      groupName: 'Byte Busters',
      eventId: hackathon._id,
      isPaymentDone: false,
      isPresent: false,
      createdBy: student1._id,
      modifiedBy: student1._id
    });

    const group4 = await Group.create({
      groupName: 'Robo Makers',
      eventId: robotics._id,
      isPaymentDone: true,
      isPresent: true,
      createdBy: student2._id,
      modifiedBy: student2._id
    });

    const group5 = await Group.create({
      groupName: 'Circuit Breakers',
      eventId: robotics._id,
      isPaymentDone: true,
      isPresent: false,
      createdBy: student1._id,
      modifiedBy: student1._id
    });

    const group6 = await Group.create({
      groupName: 'Neural Nets',
      eventId: aiCompetition._id,
      isPaymentDone: true,
      isPresent: true,
      createdBy: student1._id,
      modifiedBy: student1._id
    });

    const group7 = await Group.create({
      groupName: 'Design Gurus',
      eventId: designThinkathon._id,
      isPaymentDone: true,
      isPresent: true,
      createdBy: student2._id,
      modifiedBy: student2._id
    });

    console.log('✅ Groups created');

    // Create Participants
    await Participant.create([
      { groupId: group1._id, name: 'Alice Johnson', enrollmentNumber: 'EN2024001', instituteName: 'MIT', city: 'Cambridge', phone: '1234567896', email: 'alice@student.com', isGroupLeader: true, modifiedBy: student1._id },
      { groupId: group1._id, name: 'Charlie Brown', enrollmentNumber: 'EN2024002', instituteName: 'MIT', city: 'Cambridge', phone: '1234567900', email: 'charlie@student.com', isGroupLeader: false, modifiedBy: student1._id },
      { groupId: group1._id, name: 'Diana Prince', enrollmentNumber: 'EN2024003', instituteName: 'MIT', city: 'Cambridge', phone: '1234567901', email: 'diana@student.com', isGroupLeader: false, modifiedBy: student1._id },
      { groupId: group2._id, name: 'Bob Williams', enrollmentNumber: 'EN2024004', instituteName: 'Stanford', city: 'Stanford', phone: '1234567897', email: 'bob@student.com', isGroupLeader: true, modifiedBy: student2._id },
      { groupId: group2._id, name: 'Eve Watson', enrollmentNumber: 'EN2024005', instituteName: 'Stanford', city: 'Stanford', phone: '1234567902', email: 'eve@student.com', isGroupLeader: false, modifiedBy: student2._id },
      { groupId: group2._id, name: 'Frank Castle', enrollmentNumber: 'EN2024006', instituteName: 'Stanford', city: 'Stanford', phone: '1234567903', email: 'frank@student.com', isGroupLeader: false, modifiedBy: student2._id },
      { groupId: group3._id, name: 'Grace Hopper', enrollmentNumber: 'EN2024007', instituteName: 'Harvard', city: 'Cambridge', phone: '1234567904', email: 'grace@student.com', isGroupLeader: true, modifiedBy: student1._id },
      { groupId: group3._id, name: 'Hank Pym', enrollmentNumber: 'EN2024008', instituteName: 'Harvard', city: 'Cambridge', phone: '1234567905', email: 'hank@student.com', isGroupLeader: false, modifiedBy: student1._id },
      { groupId: group4._id, name: 'Bob Williams', enrollmentNumber: 'EN2024004', instituteName: 'Stanford', city: 'Stanford', phone: '1234567897', email: 'bob@student.com', isGroupLeader: true, modifiedBy: student2._id },
      { groupId: group4._id, name: 'Iris West', enrollmentNumber: 'EN2024009', instituteName: 'MIT', city: 'Cambridge', phone: '1234567906', email: 'iris@student.com', isGroupLeader: false, modifiedBy: student2._id },
      { groupId: group4._id, name: 'Jack Reacher', enrollmentNumber: 'EN2024010', instituteName: 'MIT', city: 'Cambridge', phone: '1234567907', email: 'jack@student.com', isGroupLeader: false, modifiedBy: student2._id },
      { groupId: group5._id, name: 'Alice Johnson', enrollmentNumber: 'EN2024001', instituteName: 'MIT', city: 'Cambridge', phone: '1234567896', email: 'alice@student.com', isGroupLeader: true, modifiedBy: student1._id },
      { groupId: group5._id, name: 'Kate Bishop', enrollmentNumber: 'EN2024011', instituteName: 'MIT', city: 'Cambridge', phone: '1234567908', email: 'kate@student.com', isGroupLeader: false, modifiedBy: student1._id },
      { groupId: group5._id, name: 'Leo Fitz', enrollmentNumber: 'EN2024012', instituteName: 'MIT', city: 'Cambridge', phone: '1234567909', email: 'leo@student.com', isGroupLeader: false, modifiedBy: student1._id },
      { groupId: group6._id, name: 'Alice Johnson', enrollmentNumber: 'EN2024001', instituteName: 'MIT', city: 'Cambridge', phone: '1234567896', email: 'alice@student.com', isGroupLeader: true, modifiedBy: student1._id },
      { groupId: group6._id, name: 'Maya Lopez', enrollmentNumber: 'EN2024013', instituteName: 'Stanford', city: 'Stanford', phone: '1234567910', email: 'maya@student.com', isGroupLeader: false, modifiedBy: student1._id },
      { groupId: group7._id, name: 'Bob Williams', enrollmentNumber: 'EN2024004', instituteName: 'Stanford', city: 'Stanford', phone: '1234567897', email: 'bob@student.com', isGroupLeader: true, modifiedBy: student2._id },
      { groupId: group7._id, name: 'Nat Romanoff', enrollmentNumber: 'EN2024014', instituteName: 'Harvard', city: 'Cambridge', phone: '1234567911', email: 'nat@student.com', isGroupLeader: false, modifiedBy: student2._id },
      { groupId: group7._id, name: 'Oscar Isaac', enrollmentNumber: 'EN2024015', instituteName: 'Harvard', city: 'Cambridge', phone: '1234567912', email: 'oscar@student.com', isGroupLeader: false, modifiedBy: student2._id }
    ]);

    console.log('✅ Participants created');

    // Create Winners
    await EventWiseWinner.create([
      { eventId: hackathon._id, groupId: group1._id, sequence: 1, modifiedBy: admin._id },
      { eventId: hackathon._id, groupId: group2._id, sequence: 2, modifiedBy: admin._id },
      { eventId: hackathon._id, groupId: group3._id, sequence: 3, modifiedBy: admin._id },
      { eventId: robotics._id, groupId: group4._id, sequence: 1, modifiedBy: admin._id },
      { eventId: robotics._id, groupId: group5._id, sequence: 2, modifiedBy: admin._id },
      { eventId: aiCompetition._id, groupId: group6._id, sequence: 1, modifiedBy: admin._id }
    ]);

    console.log('✅ Winners declared');

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