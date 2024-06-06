const connectDB = require('./connectDB');
const { mongoURI } = require('./../config.json');

// Wrap the code in an immediately invoked async function
(async () => {
    try {
        // Connect to the database using connectDB function
        const { threadModel, userModel } = await connectDB(mongoURI);

        // Function to read a user by userID
        async function readUser(userId) {
            try {
                const user = await userModel.findOne({ userID: userId });
                if (!user) {
                    console.log('User not found');
                } else {
                    console.log('User found:', user);
                }
                return user;
            } catch (error) {
                console.error('Error reading user:', error);
                return null;
            }
        }

        // Function to update a user by userID
        async function updateUser(userId, updateData) {
            try {
                const updatedUser = await userModel.findOneAndUpdate({ userID: userId }, updateData, { new: true, runValidators: true });
                if (!updatedUser) {
                    console.log('User not found');
                } else {
                    console.log('User updated:', updatedUser);
                }
                return updatedUser;
            } catch (error) {
                console.error('Error updating user:', error);
                return null;
            }
        }

        // Function to read a thread by chatId
        async function readThread(chatId) {
            try {
                const thread = await threadModel.findOne({ chatId });
                if (!thread) {
                    console.log('Thread not found');
                } else {
                    console.log('Thread found:', thread);
                }
                return thread;
            } catch (error) {
                console.error('Error reading thread:', error);
                return null;
            }
        }

        // Function to update a thread by chatId
        async function updateThread(chatId, updateData) {
            try {
                const updatedThread = await threadModel.findOneAndUpdate({ chatId }, updateData, { new: true, runValidators: true });
                if (!updatedThread) {
                    console.log('Thread not found');
                } else {
                    console.log('Thread updated:', updatedThread);
                }
                return updatedThread;
            } catch (error) {
                console.error('Error updating thread:', error);
                return null;
            }
        }

        // Export operators for use in commands and events
        module.exports = {
            readUser,
            updateUser,
            readThread,
            updateThread
        };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
})();
