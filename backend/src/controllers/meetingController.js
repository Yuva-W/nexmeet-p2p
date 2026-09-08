import Meeting from "../models/meetingModel.js";

const generateCode = () => Math.random().toString(36).substring(2, 10);

const createMeeting = async (req, res) => {
    try {
        let meetingCode;
        let attempts = 0;
        // Retry on collision (unique index)
        while (attempts < 5) {
            meetingCode = generateCode();
            try {
                const meeting = await Meeting.create({
                    user_id: req.user.id,
                    meetingCode,
                });

                return res.status(201).json({
                    success: true,
                    message: "Meeting created successfully",
                    meetingCode: meeting.meetingCode,
                });
            } catch (err) {
                if (err.code === 11000) {
                    attempts += 1;
                    continue;
                }
                throw err;
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to generate unique meeting code",
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to create meeting",
        });
    }
};

const getHistory = async (req, res) => {
    try {
        const meetings = await Meeting.find({ user_id: req.user.id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            meetings,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch meeting history",
        });
    }
};

export { createMeeting, getHistory };