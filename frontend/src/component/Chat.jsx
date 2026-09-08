import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/authContext";

const Chat = ({ socket }) => {
  const { userData } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const listRef = useRef(null);

  const username = userData?.username || userData?.name || "You";

  // Listen for incoming chat messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data, sender, socketId) => {
      setMessages((prev) => [
        ...prev,
        {
          data,
          sender,
          socketId,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };

    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !socket) return;
    const text = message.trim();
    // Emit to backend: (message, username)
    socket.emit("chat-message", text, username);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#101827]">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Chat</h3>
        <p className="text-xs text-slate-400">
          {socket ? "Connected" : "Connecting..."} • {messages.length} message{messages.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto p-3"
        style={{ scrollbarWidth: "thin" }}
      >
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg, index) => {
            const isOwn = socket && msg.socketId === socket.id;
            return (
              <div
                key={index}
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    isOwn
                      ? "rounded-br-sm bg-yellow-400 text-black"
                      : "rounded-bl-sm bg-slate-800 text-white"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-80">
                    {isOwn ? "You" : msg.sender}
                  </p>
                  <p className="mt-0.5 break-words text-sm leading-snug">
                    {msg.data}
                  </p>
                </div>
                <span className="mt-1 px-1 text-[10px] text-slate-500">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter message..."
            disabled={!socket}
            className="min-w-0 flex-1 rounded-full border border-slate-700 bg-[#0f1a2e] px-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-yellow-400 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || !socket}
            className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        {!socket && (
          <p className="mt-2 text-xs text-slate-500">Connecting to chat...</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
