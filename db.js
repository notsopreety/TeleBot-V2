const express = require('express');
const connectDB = require('./database/connectDB');

const app = express();
app.use(express.json());

const uri = 'mongodb+srv://itssamir444:XKLWXz7zfqv8p0vv@telebot.7s6rdvv.mongodb.net/?retryWrites=true&w=majority&appName=telebot';

(async () => {
  try {
    const { threadModel, userModel } = await connectDB(uri);

    // Create a new user
    const createUser = async () => {
      const newUser = new userModel({
        userID: '5947023314',
        username: 'samirxyz',
        first_name: 'Samir',
        last_name: 'Thakuri',
        banned: false,
      });

      try {
        const savedUser = await newUser.save();
        console.log('User created:', savedUser);
      } catch (err) {
        console.error('Error creating user:', err);
      }
    };

    // Create a new thread
    const createThread = async () => {
      const newThread = new threadModel({
        chatId: '12345',
        users: {
          '5947023314': {
            totalMsg: 100,
            gcBan: false,
          },
        },
      });

      try {
        const savedThread = await newThread.save();
        console.log('Thread created:', savedThread);
      } catch (err) {
        console.error('Error creating thread:', err);
      }
    };

    // // Read a user by userID
    // const readUser = async (userID) => {
    //   try {
    //     const user = await userModel.findOne({ userID });
    //     if (!user) {
    //       console.log('User not found');
    //     } else {
    //       console.log('User found:', user);
    //     }
    //   } catch (err) {
    //     console.error('Error reading user:', err);
    //   }
    // };

    // // Read a thread by chatId
    // const readThread = async (chatId) => {
    //   try {
    //     const thread = await threadModel.findOne({ chatId });
    //     if (!thread) {
    //       console.log('Thread not found');
    //     } else {
    //       console.log('Thread found:', thread);
    //     }
    //   } catch (err) {
    //     console.error('Error reading thread:', err);
    //   }
    // };

    // // Update a user by userID
    // const updateUser = async (userID, updateData) => {
    //   try {
    //     const updatedUser = await userModel.findOneAndUpdate({ userID }, updateData, { new: true, runValidators: true });
    //     if (!updatedUser) {
    //       console.log('User not found');
    //     } else {
    //       console.log('User updated:', updatedUser);
    //     }
    //   } catch (err) {
    //     console.error('Error updating user:', err);
    //   }
    // };

    // // Update a thread by chatId
    // const updateThread = async (chatId, updateData) => {
    //   try {
    //     const updatedThread = await threadModel.findOneAndUpdate({ chatId }, updateData, { new: true, runValidators: true });
    //     if (!updatedThread) {
    //       console.log('Thread not found');
    //     } else {
    //       console.log('Thread updated:', updatedThread);
    //     }
    //   } catch (err) {
    //     console.error('Error updating thread:', err);
    //   }
    // };

    // // Delete a user by userID
    // const deleteUser = async (userID) => {
    //   try {
    //     const deletedUser = await userModel.findOneAndDelete({ userID });
    //     if (!deletedUser) {
    //       console.log('User not found');
    //     } else {
    //       console.log('User deleted:', deletedUser);
    //     }
    //   } catch (err) {
    //     console.error('Error deleting user:', err);
    //   }
    // };

    // // Delete a thread by chatId
    // const deleteThread = async (chatId) => {
    //   try {
    //     const deletedThread = await threadModel.findOneAndDelete({ chatId });
    //     if (!deletedThread) {
    //       console.log('Thread not found');
    //     } else {
    //       console.log('Thread deleted:', deletedThread);
    //     }
    //   } catch (err) {
    //     console.error('Error deleting thread:', err);
    //   }
    // };

    // Perform CRUD operations
    await createUser();
    // await readUser('5947023314');
    // await updateUser('5947023314', { first_name: 'UpdatedName' });
    // await deleteUser('5947023314');

    await createThread();
    // await readThread('12345');
    // await updateThread('12345', { 'users.5947023314.totalMsg': 200 });
    // await deleteThread('12345');

    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
})();
