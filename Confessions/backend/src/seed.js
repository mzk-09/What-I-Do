require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Group = require('./models/Group');
const { generateUsername } = require('./utils/generateUsername');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/confessions';

const confessions = [
  'I pretend to be confident but I cry in my car after work sometimes.',
  'I\'ve been lying about having friends. I eat lunch alone every day.',
  'I ghosted my best friend because I was jealous of their success.',
  'I haven\'t spoken to my family in two years and honestly I feel free.',
  'I fake laugh at my boss\'s jokes so much I forgot what real laughter sounds like.',
  'I still have feelings for my ex from three years ago.',
  'I cheated on an exam and got the highest score. Never told anyone.',
  'I pretend to like outdoor activities on dates. I hate being outside.',
  'Sometimes I leave parties early and just sit in my car listening to music.',
  'I\'ve memorized people\'s coffee orders to seem like a better person than I am.',
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Post.deleteMany({});
  await Group.deleteMany({});
  console.log('Cleared existing data');

  // Admin user
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    username: 'ShadowAdmin001',
    email: 'admin@confessions.app',
    password: adminPass,
    role: 'admin',
  });

  // 5 regular users
  const users = [];
  for (let i = 0; i < 5; i++) {
    const username = generateUsername();
    const pass = await bcrypt.hash('password123', 10);
    const user = await User.create({ username, password: pass });
    users.push(user);
  }

  // 2 groups
  const group1 = await Group.create({
    name: 'Night Owls',
    inviteCode: 'NIGHT1',
    members: [users[0]._id, users[1]._id, users[2]._id],
    createdBy: users[0]._id,
  });

  await Group.create({
    name: 'Deep Thoughts',
    inviteCode: 'DEEP01',
    members: [users[2]._id, users[3]._id, users[4]._id],
    createdBy: users[2]._id,
  });

  // 10 public posts
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length];
    await Post.create({
      content: confessions[i],
      userId: user._id,
      isPublic: true,
      likes: i % 2 === 0 ? [users[(i + 1) % users.length]._id] : [],
    });
  }

  // 2 group posts
  await Post.create({
    content: 'Sometimes I think the night is the only honest time of day.',
    userId: users[0]._id,
    groupId: group1._id,
    isPublic: false,
  });

  console.log('\n✅ Seed complete!');
  console.log('Admin login: admin@confessions.app / admin123');
  console.log('Group invite codes: NIGHT1, DEEP01');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
