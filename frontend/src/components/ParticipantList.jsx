import { useContext } from "react";
import { AuthContext } from "../context/authContext";

const ParticipantList = ({ users = [], isMicOn = true, isCamOn = true }) => {
  const { userData } = useContext(AuthContext);
  const localName = userData?.name || userData?.username || "You";
  const total = users.length + 1;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#101827]">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Participants</h3>
        <p className="text-xs text-slate-400">
          {total} participant{total !== 1 ? "s" : ""} in meeting
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Local participant */}
        <div className="flex items-center gap-3 rounded-lg bg-[#0f1a2e] border border-slate-800 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-black">
            {localName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {localName} <span className="text-xs text-slate-400">(You)</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className={isMicOn ? "text-green-400" : "text-red-400"}>
                {isMicOn ? "🎤" : "🔇"}
              </span>
              <span className={isCamOn ? "text-green-400" : "text-red-400"}>
                {isCamOn ? "📹" : "📹 Off"}
              </span>
            </p>
          </div>
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>

        {/* Remote participants */}
        {users.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No other participants yet</p>
        ) : (
          users.map((userId, index) => (
            <div
              key={userId}
              className="flex items-center gap-3 rounded-lg bg-[#0f1a2e] border border-slate-800 px-3 py-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
                P{index + 1}
              </div>
              <div className="flex-1 min-w-0" title={userId}>
                <p className="text-sm font-medium text-white truncate">Participant {index + 1}</p>
                <p className="text-xs text-slate-500 truncate">Connected</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-800 px-3 py-2">
        <p className="text-xs text-slate-500">Invite others by sharing the meeting code</p>
      </div>
    </div>
  );
};

export default ParticipantList;
