import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const VideoMeet = () => {
  const { code } = useParams();

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);

  const peersRef = useRef({});
  const streamsRef = useRef({});
  const localStreamRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});

  // =========================
  // CREATE PEER
  // =========================

  const createPeer = (userId) => {
    if (peersRef.current[userId]) {
      return peersRef.current[userId];
    }

    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    // Add local audio/video
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    // Receive remote stream
    peer.ontrack = (event) => {
      console.log("Remote stream received:", userId);

      const stream = event.streams[0];

      if (!stream) {
        return;
      }

      streamsRef.current[userId] = stream;

      setRemoteStreams((prev) => ({
        ...prev,
        [userId]: stream,
      }));
    };

    // ICE candidate
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("signal", userId, {
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log(
        `Peer ${userId} state:`,
        peer.connectionState
      );

      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "closed"
      ) {
        peer.close();

        delete peersRef.current[userId];

        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    };

    peersRef.current[userId] = peer;

    return peer;
  };

  // =========================
  // GET CAMERA + MIC
  // =========================

  useEffect(() => {
    const startMeeting = async () => {
      try {
        console.log("Requesting camera and microphone...");

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        console.log("Local media started");

        connectSocket();
      } catch (error) {
        console.error(
          "Camera/Microphone error:",
          error
        );
      }
    };

    startMeeting();

    return () => {
      console.log("Cleaning meeting...");

      // Stop camera and microphone
      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      // Close peers
      Object.values(peersRef.current).forEach(
        (peer) => peer.close()
      );

      peersRef.current = {};
      streamsRef.current = {};

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [code]);

  // =========================
  // SOCKET CONNECTION
  // =========================

  const connectSocket = () => {
    console.log("Connecting to socket...");

    const socket = io("http://localhost:8000");

    socketRef.current = socket;

    // =========================
    // CONNECT
    // =========================

    socket.on("connect", () => {
      console.log(
        "Socket connected:",
        socket.id
      );

      setConnected(true);

      socket.emit("join-call", code);
    });

    // =========================
    // EXISTING USERS
    // =========================

    socket.on(
      "existing-users",
      async (existingUsers) => {
        console.log(
          "Existing users:",
          existingUsers
        );

        setUsers(existingUsers);

        for (const userId of existingUsers) {
          const peer = createPeer(userId);

          const offer =
            await peer.createOffer();

          await peer.setLocalDescription(
            offer
          );

          socket.emit("signal", userId, {
            type: "offer",
            offer,
          });
        }
      }
    );

    // =========================
    // USER JOINED
    // =========================

    socket.on(
      "user-joined",
      async (userId) => {
        console.log(
          "User joined:",
          userId
        );

        setUsers((prev) => {
          if (prev.includes(userId)) {
            return prev;
          }

          return [...prev, userId];
        });
      }
    );

    // =========================
    // SIGNAL
    // =========================

    socket.on(
      "signal",
      async (fromId, message) => {
        console.log(
          "Signal received:",
          message.type
        );

        let peer =
          peersRef.current[fromId];

        // =========================
        // OFFER
        // =========================

        if (message.type === "offer") {
          peer = createPeer(fromId);

          await peer.setRemoteDescription(
            new RTCSessionDescription(
              message.offer
            )
          );

          const answer =
            await peer.createAnswer();

          await peer.setLocalDescription(
            answer
          );

          socket.emit("signal", fromId, {
            type: "answer",
            answer,
          });
        }

        // =========================
        // ANSWER
        // =========================

        else if (
          message.type === "answer"
        ) {
          if (!peer) {
            return;
          }

          await peer.setRemoteDescription(
            new RTCSessionDescription(
              message.answer
            )
          );
        }

        // =========================
        // ICE CANDIDATE
        // =========================

        else if (
          message.type === "ice-candidate"
        ) {
          if (!peer) {
            return;
          }

          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(
                message.candidate
              )
            );
          } catch (error) {
            console.error(
              "ICE candidate error:",
              error
            );
          }
        }
      }
    );

    // =========================
    // USER LEFT
    // =========================

    socket.on(
      "user-left",
      (userId) => {
        console.log(
          "User left:",
          userId
        );

        setUsers((prev) =>
          prev.filter(
            (id) => id !== userId
          )
        );

        if (peersRef.current[userId]) {
          peersRef.current[userId].close();

          delete peersRef.current[userId];
        }

        delete streamsRef.current[userId];

        setRemoteStreams((prev) => {
          const updated = { ...prev };

          delete updated[userId];

          return updated;
        });
      }
    );

    // =========================
    // SOCKET ERROR
    // =========================

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket connection error:",
          error.message
        );

        setConnected(false);
      }
    );

    // =========================
    // DISCONNECT
    // =========================

    socket.on("disconnect", () => {
      console.log("Socket disconnected");

      setConnected(false);
    });
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">

      {/* Header */}

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-bold">
          Next
          <span className="text-yellow-400">
            Meet
          </span>
        </h1>

        <div>
          Status:{" "}

          {connected ? (
            <span className="text-green-400">
              Connected
            </span>
          ) : (
            <span className="text-red-400">
              Disconnected
            </span>
          )}
        </div>

      </div>

      {/* Meeting code */}

      <p className="mt-4 text-gray-400">
        Meeting Code: {code}
      </p>

      {/* Local Video */}

      <div className="mt-8">

        <h2 className="mb-3 text-xl font-semibold">
          You
        </h2>

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-xl rounded-lg bg-black"
        />

      </div>

      {/* Participants */}

      <div className="mt-8">

        <h2 className="text-xl font-semibold">
          Participants
        </h2>

        <p className="mt-2 text-gray-400">
          {users.length} participant(s)
        </p>

      </div>

      {/* Remote Videos */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {Object.entries(remoteStreams).map(
          ([userId, stream]) => (
            <RemoteVideo
              key={userId}
              userId={userId}
              stream={stream}
            />
          )
        )}

      </div>

    </div>
  );
};

// =========================
// REMOTE VIDEO
// =========================

const RemoteVideo = ({
  userId,
  stream,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="overflow-hidden rounded-lg bg-gray-900">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full bg-black"
      />

      <p className="p-3 text-sm text-gray-400">
        {userId}
      </p>

    </div>
  );
};

export default VideoMeet;