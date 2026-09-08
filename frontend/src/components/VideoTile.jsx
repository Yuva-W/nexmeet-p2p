import { useEffect, useRef } from "react";

const VideoTile = ({
  stream,
  label = "User",
  isLocal = false,
  muted = false,
  isCameraOn = true,
  isMicOn = true,
  isScreenSharing = false,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  const showPlaceholder = !isCameraOn && !isScreenSharing;
  const shouldShowVideo = isScreenSharing || isCameraOn;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0f1a2e] border border-slate-800 w-full aspect-video">
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        className={`h-full w-full object-cover bg-black ${showPlaceholder ? "opacity-0" : "opacity-100"}`}
      />

      {/* Camera off placeholder – hidden while screen sharing */}
      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f1a2e]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-2xl font-bold">
            {label.slice(0, 2).toUpperCase()}
          </div>
          <p className="mt-3 text-sm text-slate-400">Camera off</p>
        </div>
      )}

      {/* Screen sharing badge */}
      {isScreenSharing && isLocal && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-yellow-400 px-2.5 py-1 text-[11px] font-semibold text-black">
          <span>🖥</span> Sharing screen
        </div>
      )}

      {/* Label + mic status */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs backdrop-blur">
        <span>
          {label} {isLocal && isScreenSharing ? "• Screen" : ""}
        </span>
        {!isMicOn && (
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px]">Muted</span>
        )}
      </div>

      {/* Top-right pill */}
      <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[11px] text-slate-300">
        {isLocal ? (
          <>
            {isScreenSharing ? "🖥 Sharing" : isMicOn ? "🎤 On" : "🔇 Off"} •{" "}
            {isScreenSharing ? "📹 Screen" : isCameraOn ? "📹 On" : "📹 Off"}
          </>
        ) : (
          <span className="truncate max-w-[120px] inline-block">{label}</span>
        )}
      </div>
    </div>
  );
};

export default VideoTile;
