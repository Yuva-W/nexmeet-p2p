import VideoTile from "./VideoTile";

const VideoGrid = ({
  localStream,
  screenStream,
  isMicOn = true,
  isCamOn = true,
  isScreenSharing = false,
  remoteStreams = {},
  code,
  localLabel = "You",
}) => {
  const hasRemote = Object.keys(remoteStreams).length > 0;
  const displayStream = isScreenSharing && screenStream ? screenStream : localStream;

  return (
    <main className="flex-1 overflow-y-auto p-3 md:p-6">
      <div
        className={`grid gap-3 md:gap-4 h-full ${
          hasRemote
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 content-start"
            : "grid-cols-1 place-items-center"
        }`}
      >
        {/* Local Video Tile */}
        <VideoTile
          stream={displayStream}
          label={localLabel}
          isLocal={true}
          muted={true}
          isCameraOn={isCamOn}
          isMicOn={isMicOn}
          isScreenSharing={isScreenSharing}
        />

        {/* Remote Videos */}
        {Object.entries(remoteStreams).map(([userId, stream], index) => (
          <VideoTile
            key={userId}
            stream={stream}
            label={`Participant ${index + 1}`}
            isLocal={false}
            muted={false}
            isCameraOn={true}
            isMicOn={true}
            isScreenSharing={false}
          />
        ))}
      </div>

      {/* Empty state when alone */}
      {!hasRemote && (
        <p className="mt-4 text-center text-sm text-slate-500">
          Waiting for others to join... Share the code{" "}
          <span className="font-mono text-slate-300">{code}</span>
        </p>
      )}
    </main>
  );
};

export default VideoGrid;
