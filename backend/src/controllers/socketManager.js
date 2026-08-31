import { Server } from "socket.io";

const connectToSocket = (server) =>{
    const io = new Server(server, {
        cors: {
            origin: "*",
            method: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`connection established ${socket.id}`);

        socket.on("join-call", (path) => {
            
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            // connections[path].forEach(ele => {
            //     io.to(ele).emit("user-joined", socket.id, connections[path]);
            // });
            
            for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }

            if (connections[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender']);
                }
            }

        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections).reduce(
                ([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];
                },
                ["", false]
            );

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({"data": data, "sender": sender, "socket-id-sender": socket.id});
                console.log(`key: ${sender}: ${data}`);

                connections[matchingRoom].forEach(ele => {
                    io.to(ele).emit("chat-message", data, sender, socket.id);
                });
            }  

        });

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date());

            for( const [k, v] of JSON.parse(json.stringify(Object.entries(connections)))) {
                
                for(let a =0; a< v.length; ++a){

                    if (v[a] === socket.id) {
                        key = k;
    
                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit("user-left", socket.id);
                        }
        
                        var index = connections[key].indexOf(socket.id);
        
                        connactions[key].splice(index, 1);
    
                        if (connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                }
            }

            console.log(`user left ${socket.id}`);
        });

    });

    return io;
};

export default connectToSocket;