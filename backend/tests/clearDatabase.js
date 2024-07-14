const mongoose = require('mongoose');
const User = require('../models/User');

async function clearDatabase() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  await User.deleteMany({});
  console.log('Database cleared');
  
  await mongoose.disconnect();
}

clearDatabase().then(() => {
  console.log('Ready for testing');
});
 
