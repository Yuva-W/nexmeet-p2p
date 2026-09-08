import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Chat from "../components/Chat";

const VideoMeet = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const containerRef = useRef(null);

  const peersRef = useRef({});
  const streamsRef = useRef({});
  const localStreamRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});

  // Controls state
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);

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
  // MEETING CONTROLS (Phase 1)
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
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
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
        const audioEnabled = stream.getAudioTracks()[0]?.enabled ?? true;
        const videoEnabled = stream.getVideoTracks()[0]?.enabled ?? true;
        setIsMicOn(audioEnabled);
        setIsCamOn(videoEnabled);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
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

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isCamOn]);

  const totalParticipants = users.length + 1; // + you
  const hasRemote = Object.keys(remoteStreams).length > 0;

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

      {/* Main content: videos + chat */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Video area */}
        <div className="flex flex-1 flex-col min-h-0">
          {/* Video Grid */}
          <main className="flex-1 overflow-y-auto p-3 md:p-6">
            <div
              className={`grid gap-3 md:gap-4 h-full ${
                hasRemote
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 content-start"
                  : "grid-cols-1 place-items-center"
              }`}
            >
              {/* Local Video Tile */}
              <div className="relative overflow-hidden rounded-xl bg-[#0f1a2e] border border-slate-800 w-full max-w-3xl aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full object-cover bg-black ${!isCamOn ? "opacity-0" : "opacity-100"}`}
                />

                {/* Camera off placeholder */}
                {!isCamOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f1a2e]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-2xl font-bold">
                      You
                    </div>
                    <p className="mt-3 text-sm text-slate-400">Camera off</p>
                  </div>
                )}

                {/* Label + mic status */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs backdrop-blur">
                  <span>You</span>
                  {!isMicOn && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px]">Muted</span>
                  )}
                </div>

                {/* Pill: connection */}
                <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[11px] text-slate-300">
                  {isMicOn ? "🎤 On" : "🔇 Off"} • {isCamOn ? "📹 On" : "📹 Off"}
                </div>
              </div>

              {/* Remote Videos */}
              {Object.entries(remoteStreams).map(([userId, stream]) => (
                <RemoteVideo key={userId} userId={userId} stream={stream} />
              ))}
            </div>

            {/* Empty state when alone */}
            {!hasRemote && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Waiting for others to join... Share the code <span className="font-mono text-slate-300">{code}</span>
              </p>
            )}
          </main>
        </div>

        {/* Chat panel */}
        {showChat && (
          <aside className="flex h-[420px] w-full flex-col border-t border-slate-800 bg-[#070d1a] lg:h-auto lg:w-[380px] lg:border-l lg:border-t-0">
            <Chat socket={socket} />
          </aside>
        )}
      </div>

      {/* Controls Bar */}
      <footer className="sticky bottom-0 z-10 border-t border-slate-800 bg-[#070d1a]/90 backdrop-blur px-4 py-3 md:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 md:gap-3">
          {/* Mute */}
          <button
            onClick={handleToggleMic}
            aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
            title={isMicOn ? "Mute" : "Unmute"}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition border ${
              isMicOn
                ? "bg-[#1e2a44] border-slate-700 hover:bg-[#23304f] text-white"
                : "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
            }`}
          >
            <span className="text-base leading-none">
              {isMicOn ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
                  <path d="M19 10a7 7 0 0 1-14 0" />
                  <path d="M12 19v4" />
                  <path d="M8 23h8" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 1l22 22" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 10M12 19v4M8 23h8" />
                </svg>
              )}
            </span>
            <span className="hidden sm:inline">{isMicOn ? "Mute" : "Unmute"}</span>
          </button>

          {/* Camera */}
          <button
            onClick={handleToggleCamera}
            aria-label={isCamOn ? "Turn off camera" : "Turn on camera"}
            title={isCamOn ? "Camera off" : "Camera on"}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition border ${
              isCamOn
                ? "bg-[#1e2a44] border-slate-700 hover:bg-[#23304f] text-white"
                : "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
            }`}
          >
            <span className="text-base leading-none">
              {isCamOn ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 7l-7 5 7 5V7Z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 16L3 3" />
                  <path d="M10.58 10.58A2 2 0 0 0 14 14" />
                  <path d="M14.5 6.5A2 2 0 0 0 9 9.5" />
                  <path d="M16 16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 1.17-1.83" />
                  <path d="M23 7l-4.5 3.2A2 2 0 0 0 17 12v0a2 2 0 0 0 1.5 1.8L23 17V7Z" />
                </svg>
              )}
            </span>
            <span className="hidden sm:inline">Camera</span>
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setShowChat((v) => !v)}
            aria-label={showChat ? "Hide chat" : "Show chat"}
            title={showChat ? "Hide chat" : "Show chat"}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition border ${
              showChat
                ? "bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-300"
                : "bg-[#1e2a44] border-slate-700 hover:bg-[#23304f] text-white"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
            </svg>
            <span className="hidden sm:inline">{showChat ? "Hide Chat" : "Chat"}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="flex items-center gap-2 rounded-full bg-[#1e2a44] border border-slate-700 px-4 py-2.5 text-sm font-medium hover:bg-[#23304f] transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {isFullscreen ? (
                <>
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </>
              ) : (
                <>
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </>
              )}
            </svg>
            <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
          </button>

          {/* Divider */}
          <div className="mx-1 hidden h-8 w-px bg-slate-700 sm:block" />

          {/* Leave */}
          <button
            onClick={handleLeaveMeeting}
            aria-label="Leave meeting"
            title="Leave meeting"
            className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="23" y1="11" x2="17" y2="11" />
              <path d="M16 8l3 3-3 3" />
            </svg>
            Leave
          </button>
        </div>
      </footer>
    </div>
  );
};

// =========================
// REMOTE VIDEO
// =========================

const RemoteVideo = ({ userId, stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0f1a2e] border border-slate-800 aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover bg-black"
      />
      <p className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs backdrop-blur">
        {userId.slice(0, 8)}
      </p>
    </div>
  );
};

export default VideoMeet;
