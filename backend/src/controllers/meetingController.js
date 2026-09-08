import Meeting from "../models/meetingModel.js";

const createMeeting = async (req, res) => {
    try {
        const meetingCode = Math.random()
            .toString(36)
            .substring(2, 10);

        const meeting = await Meeting.create({
            user_id: req.user.id,
            meetingCode,
        });

        res.status(201).json({
            success: true,
            message: "Meeting created successfully",
            meetingCode: meeting.meetingCode,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to create meeting",
        });
    }
};

export { createMeeting };