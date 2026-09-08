const MeetingControls = ({
  isMicOn = true,
  isCamOn = true,
  isScreenSharing = false,
  isFullscreen = false,
  showChat = false,
  showParticipants = false,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleFullscreen,
  onLeave,
}) => {
  return (
    <footer className="sticky bottom-0 z-10 border-t border-slate-800 bg-[#070d1a]/90 backdrop-blur px-4 py-3 md:py-4">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 md:gap-3">
        {/* Mute */}
        <button
          onClick={onToggleMic}
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
          onClick={onToggleCamera}
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

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          aria-label={isScreenSharing ? "Stop screen sharing" : "Share screen"}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition border ${
            isScreenSharing
              ? "bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-300"
              : "bg-[#1e2a44] border-slate-700 hover:bg-[#23304f] text-white"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
          <span className="hidden sm:inline">{isScreenSharing ? "Stop Share" : "Screen"}</span>
        </button>

        {/* Participants toggle */}
        <button
          onClick={onToggleParticipants}
          aria-label={showParticipants ? "Hide participants" : "Show participants"}
          title={showParticipants ? "Hide participants" : "Show participants"}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition border ${
            showParticipants
              ? "bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-300"
              : "bg-[#1e2a44] border-slate-700 hover:bg-[#23304f] text-white"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="hidden sm:inline">{showParticipants ? "Hide" : "People"}</span>
        </button>

        {/* Chat toggle */}
        <button
          onClick={onToggleChat}
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
          onClick={onToggleFullscreen}
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
          onClick={onLeave}
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
  );
};

export default MeetingControls;
