import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Chat from "../components/Chat";
import VideoGrid from "../components/VideoGrid";
import MeetingControls from "../components/MeetingControls";
import ParticipantList from "../components/ParticipantList";

const VideoMeet = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const containerRef = useRef(null);

  const peersRef = useRef({});
  const streamsRef = useRef({});
  const localStreamRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});

  // Media streams for UI
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // Controls state
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Screen sharing refs
  const screenStreamRef = useRef(null);
  const cameraTrackRef = useRef(null);
  const isScreenSharingRef = useRef(false);

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
    // If screen sharing is active, send screen video track + mic audio instead of camera
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });

      if (isScreenSharingRef.current && screenStreamRef.current) {
        const screenVideoTrack = screenStreamRef.current.getVideoTracks()[0];
        if (screenVideoTrack) {
          try {
            peer.addTrack(screenVideoTrack, screenStreamRef.current);
          } catch (e) {
            console.error("addTrack screen error:", e);
          }
        } else {
          // fallback to camera if no screen track
          localStreamRef.current.getVideoTracks().forEach((track) => {
            peer.addTrack(track, localStreamRef.current);
          });
        }
      } else {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          peer.addTrack(track, localStreamRef.current);
        });
      }
    } else if (isScreenSharingRef.current && screenStreamRef.current) {
      // edge: no local stream but screen stream exists
      screenStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, screenStreamRef.current);
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
      console.log(`Peer ${userId} state:`, peer.connectionState);

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
  // SOCKET CONNECTION
  // =========================

  const connectSocket = useCallback(() => {
    console.log("Connecting to socket...");

    const newSocket = io("http://localhost:8000");

    socketRef.current = newSocket;
    setSocket(newSocket);
    const socket = newSocket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setConnected(true);
      socket.emit("join-call", code);
    });

    socket.on("existing-users", async (existingUsers) => {
      console.log("Existing users:", existingUsers);
      setUsers(existingUsers);
      for (const userId of existingUsers) {
        const peer = createPeer(userId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("signal", userId, {
          type: "offer",
          offer,
        });
      }
    });

    socket.on("user-joined", async (userId) => {
      console.log("User joined:", userId);
      setUsers((prev) => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });
    });

    socket.on("signal", async (fromId, message) => {
      console.log("Signal received:", message.type);
      let peer = peersRef.current[fromId];
      if (message.type === "offer") {
        peer = createPeer(fromId);
        await peer.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("signal", fromId, { type: "answer", answer });
      } else if (message.type === "answer") {
        if (!peer) return;
        await peer.setRemoteDescription(new RTCSessionDescription(message.answer));
      } else if (message.type === "ice-candidate") {
        if (!peer) return;
        try {
          await peer.addIceCandidate(new RTCIceCandidate(message.candidate));
        } catch (error) {
          console.error("ICE candidate error:", error);
        }
      }
    });

    socket.on("user-left", (userId) => {
      console.log("User left:", userId);
      setUsers((prev) => prev.filter((id) => id !== userId));
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
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setConnected(false);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });
  }, [code]);

  // =========================
  // MEETING CONTROLS
  // =========================

  const handleToggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;
    const nextEnabled = !audioTracks[0].enabled;
    audioTracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsMicOn(nextEnabled);
  }, []);

  const handleToggleCamera = useCallback(() => {
    // While screen sharing, toggle the stored camera track (so state restores correctly) but keep screen visible
    if (isScreenSharingRef.current) {
      const camTrack = cameraTrackRef.current || localStreamRef.current?.getVideoTracks()[0];
      if (!camTrack) return;
      const nextEnabled = !camTrack.enabled;
      camTrack.enabled = nextEnabled;
      // also keep localStream's video track in sync
      localStreamRef.current?.getVideoTracks().forEach((t) => {
        t.enabled = nextEnabled;
      });
      setIsCamOn(nextEnabled);
      return;
    }
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;
    const nextEnabled = !videoTracks[0].enabled;
    videoTracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsCamOn(nextEnabled);
  }, []);

  // =========================
  // SCREEN SHARING
  // =========================

  const stopScreenSharing = useCallback(() => {
    const currentScreenStream = screenStreamRef.current;
    if (currentScreenStream) {
      currentScreenStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
      screenStreamRef.current = null;
    }
    setScreenStream(null);

    const cameraTrack = cameraTrackRef.current;
    let trackToRestore = cameraTrack;

    if (!trackToRestore || trackToRestore.readyState === "ended") {
      trackToRestore = localStreamRef.current?.getVideoTracks()[0] || null;
    }

    if (trackToRestore) {
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(trackToRestore).catch((err) => console.error("replaceTrack restore error:", err));
        }
      });
    }

    isScreenSharingRef.current = false;
    setIsScreenSharing(false);
    console.log("Screen sharing stopped – camera restored");
  }, []);

  const handleToggleScreenShare = useCallback(async () => {
    // If already sharing, stop and restore camera
    if (isScreenSharingRef.current) {
      stopScreenSharing();
      return;
    }

    try {
      const newScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = newScreenStream.getVideoTracks()[0];
      if (!screenTrack) {
        console.warn("No screen video track obtained");
        return;
      }

      // Save current camera track for restore
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        cameraTrackRef.current = camTrack;
      }

      screenStreamRef.current = newScreenStream;
      setScreenStream(newScreenStream);
      isScreenSharingRef.current = true;
      setIsScreenSharing(true);

      console.log("Screen sharing started");

      // Handle user clicking browser's Stop sharing
      screenTrack.onended = () => {
        console.log("Screen share ended via browser UI");
        stopScreenSharing();
      };

      // Replace camera track with screen track in all peer connections (no renegotiation)
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack).catch((err) => console.error("replaceTrack screen error:", err));
        } else {
          // Fallback if no video sender yet
          try {
            peer.addTrack(screenTrack, newScreenStream);
          } catch (e) {
            console.error("addTrack screen fallback error:", e);
          }
        }
      });
    } catch (err) {
      console.error("Screen share error:", err);
      // NotAllowedError when user cancels – keep state consistent
      isScreenSharingRef.current = false;
      setIsScreenSharing(false);
      setScreenStream(null);
    }
  }, [stopScreenSharing]);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      const el = containerRef.current;
      if (!el) return;
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const cleanupResources = useCallback(() => {
    // Stop screen share stream if active
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      screenStreamRef.current = null;
    }
    isScreenSharingRef.current = false;
    setIsScreenSharing(false);
    setScreenStream(null);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    Object.values(peersRef.current).forEach((peer) => {
      try {
        peer.close();
      } catch {
        // ignore
      }
    });
    peersRef.current = {};
    streamsRef.current = {};
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
  }, []);

  const handleLeaveMeeting = useCallback(() => {
    console.log("Leaving meeting...");
    // Proper lifecycle: Leave -> stop camera -> stop mic -> close RTCPeerConnection -> disconnect socket -> navigate /home
    cleanupResources();
    navigate("/home");
  }, [cleanupResources, navigate]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // =========================
  // GET CAMERA + MIC
  // =========================

  useEffect(() => {
    let cancelled = false;
    const startMeeting = async () => {
      try {
        console.log("Requesting camera and microphone...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
        const audioEnabled = stream.getAudioTracks()[0]?.enabled ?? true;
        const videoEnabled = stream.getVideoTracks()[0]?.enabled ?? true;
        setIsMicOn(audioEnabled);
        setIsCamOn(videoEnabled);
        console.log("Local media started");
        connectSocket();
      } catch (error) {
        console.error("Camera/Microphone error:", error);
      }
    };
    startMeeting();
    return () => {
      cancelled = true;
      console.log("Cleaning meeting (unmount)...");
      cleanupResources();
    };
  }, [code, connectSocket, cleanupResources]);

  const totalParticipants = users.length + 1; // + you

  // =========================
  // UI
  // =========================

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#020712] text-white flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3 md:px-6">
        <h1 className="text-xl font-bold tracking-tight">
          Next<span className="text-yellow-400">Meet</span>
        </h1>

        <div className="flex items-center gap-3">
          {/* Meeting code */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-[#101827] px-3 py-1.5">
            <span className="text-xs text-slate-400">Code:</span>
            <span className="text-sm font-mono font-medium">{code}</span>
            <button
              onClick={handleCopyCode}
              className="ml-1 rounded-md bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700 transition"
              title="Copy meeting code"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Participant count */}
          <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="hidden sm:inline text-slate-300">
              {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
            </span>
            <span className="sm:hidden text-slate-300">{totalParticipants}</span>
          </div>

          {/* Connection status */}
          <div className="hidden md:block text-xs">
            {connected ? (
              <span className="text-green-400">● Connected</span>
            ) : (
              <span className="text-red-400">● Disconnected</span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile meeting code bar */}
      <div className="sm:hidden flex items-center justify-between border-b border-slate-800 bg-[#0a1220] px-4 py-2">
        <p className="text-xs text-slate-400">
          Meeting code: <span className="font-mono font-medium text-white">{code}</span>
        </p>
        <button
          onClick={handleCopyCode}
          className="rounded-md bg-slate-800 px-2 py-1 text-xs"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Main content: videos + side panels */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Video area */}
        <div className="flex flex-1 flex-col min-h-0">
          <VideoGrid
            localStream={localStream}
            screenStream={screenStream}
            isMicOn={isMicOn}
            isCamOn={isCamOn}
            isScreenSharing={isScreenSharing}
            remoteStreams={remoteStreams}
            code={code}
          />
        </div>

        {/* Side panels: Participants + Chat */}
        {(showParticipants || showChat) && (
          <aside className="flex h-[420px] w-full flex-col border-t border-slate-800 bg-[#070d1a] lg:h-auto lg:w-[380px] lg:border-l lg:border-t-0 overflow-hidden">
            {showParticipants && (
              <div className={`flex flex-col overflow-hidden ${showChat ? "flex-1 border-b border-slate-800" : "flex-1"}`}>
                <ParticipantList users={users} isMicOn={isMicOn} isCamOn={isCamOn} />
              </div>
            )}
            {showChat && (
              <div className={`flex flex-col overflow-hidden ${showParticipants ? "flex-1" : "flex-1"}`}>
                <Chat socket={socket} />
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Controls Bar */}
      <MeetingControls
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        isScreenSharing={isScreenSharing}
        isFullscreen={isFullscreen}
        showChat={showChat}
        showParticipants={showParticipants}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleChat={() => setShowChat((v) => !v)}
        onToggleParticipants={() => setShowParticipants((v) => !v)}
        onToggleFullscreen={handleToggleFullscreen}
        onLeave={handleLeaveMeeting}
      />
    </div>
  );
};

export default VideoMeet;
