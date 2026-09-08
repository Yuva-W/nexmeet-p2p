import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

const connectToSocket = (server) => {

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const io = new Server(server, {
        cors: {
            origin: clientUrl,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {

        console.log("Socket connected:", socket.id);

        socket.on("join-call", (path) => {
            console.log("Joining room:", path);

            if (!connections[path]) {
                connections[path] = [];
            }

            if (!messages[path]) {
                messages[path] = [];
            }

            // Users already in the room
            const existingUsers = [...connections[path]];

            // Add new user
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            console.log("Room users:", connections[path]);

            // Tell the new user who is already here
            socket.emit("existing-users", existingUsers);

            // Tell existing users that a new user joined
            existingUsers.forEach((id) => {
                io.to(id).emit("user-joined", socket.id);
            });
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            if (!data || typeof data !== "string" || !data.trim()) return;
            const trimmed = data.trim().slice(0, 1000);

            // Find room for this socket
            let room = null;
            for (const [path, ids] of Object.entries(connections)) {
                if (ids.includes(socket.id)) {
                    room = path;
                    break;
                }
            }
            if (!room) return;

            if (!messages[room]) messages[room] = [];
            const payload = {
                data: trimmed,
                sender: sender || "Anonymous",
                socketId: socket.id,
                timestamp: new Date().toISOString(),
            };
            messages[room].push(payload);

            // Broadcast to everyone in the room (including sender)
            connections[room].forEach((id) => {
                io.to(id).emit("chat-message", payload.data, payload.sender, payload.socketId);
            });
        });

        socket.on("disconnect", () => {

            console.log("Socket disconnected:", socket.id);

            for (const [room, users] of Object.entries(connections)) {

                const index = users.indexOf(socket.id);

                if (index !== -1) {

                    users.forEach((id) => {
                        io.to(id).emit(
                            "user-left",
                            socket.id
                        );
                    });

                    users.splice(index, 1);

                    if (users.length === 0) {
                        delete connections[room];
                        delete messages[room];
                    }

                    break;
                }
            }

            delete timeOnline[socket.id];
        });
    });

    return io;
};

export default connectToSocket;