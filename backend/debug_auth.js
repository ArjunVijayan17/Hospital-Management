require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const users = await User.find({});
    console.log('All Users:', users);

    const check = new User({ name: 'Test', email: 'test3@a.com', passwordHash: 'abc', role: 'patient' });
    const err = check.validateSync();
    if (err) {
      console.log('Validation Error:', err.message);
    } else {
      console.log('Validation passed!');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
debug();
