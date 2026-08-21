import "dotenv/config";
import app from "./app.js";
import connectDB from "./src/config/db.js";

app.set("port", process.env.PORT || 8000);

const startServer = async () => {
    await connectDB();

    const PORT = app.get("port");
    app.listen(PORT, () => {
        console.log(`App is running at ${PORT}`);
    });
};

startServer();