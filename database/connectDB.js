const mongoose = require('mongoose');

const threadModel = require('./models/thread');
const userModel = require('./models/user');

module.exports = async function(uriConnect) {
  await mongoose.connect(uriConnect, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return {
    threadModel,
    userModel,
  };
};
