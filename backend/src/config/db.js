import mongoose from "mongoose";

const connectDB = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connection established..");
    } catch (e) {
        console.log("Connection Failed :",e.message);
        process.exit(1);
    }
};

export default connectDB;