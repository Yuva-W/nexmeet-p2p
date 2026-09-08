import "dotenv/config";
import { server } from "./app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
};

startServer();