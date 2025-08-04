// connect.js
const mongoose = require("mongoose");
const props = require("dotenv").config().parsed;

async function connectDB() {
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/${props.database_name}`);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }

    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection open');
    });

    mongoose.connection.on('error', (err) => {
        console.log('Mongoose default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose default connection disconnected');
    });

    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });
}

 
// Export the function
module.exports = {connectDB};