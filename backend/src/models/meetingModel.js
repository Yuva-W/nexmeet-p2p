import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        user_id: {
            type: String,
            required: true,
        },
        meetingCode: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);

export default Meeting;